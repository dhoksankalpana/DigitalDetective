from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Evidence, EvidenceActivity
from .serializers import EvidenceSerializer


class EvidenceViewSet(viewsets.ModelViewSet):
    queryset = Evidence.objects.all().order_by("-created_at")
    serializer_class = EvidenceSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print("REQUEST DATA:", request.data)
        print("REQUEST FILES:", request.FILES)

        response = super().create(request, *args, **kwargs)

        evidence_id = response.data.get("id")

        if evidence_id:
            evidence = Evidence.objects.get(id=evidence_id)

            EvidenceActivity.objects.create(
                evidence=evidence,
                user=request.user,
                action="uploaded",
                description="Evidence was uploaded and added to the case."
            )

        print("EVIDENCE CREATED:", response.data)

        return response

    def perform_create(self, serializer):
        serializer.save(collected_by=self.request.user)

    @action(detail=True, methods=["patch"])
    def verify(self, request, pk=None):
        evidence = self.get_object()

        evidence.verified = True
        evidence.save(update_fields=["verified"])

        EvidenceActivity.objects.create(
            evidence=evidence,
            user=request.user,
            action="verified",
            description="Evidence was marked as verified."
        )

        return Response(EvidenceSerializer(evidence).data)

    @action(detail=True, methods=["patch"])
    def unverify(self, request, pk=None):
        evidence = self.get_object()

        evidence.verified = False
        evidence.save(update_fields=["verified"])

        EvidenceActivity.objects.create(
            evidence=evidence,
            user=request.user,
            action="unverified",
            description="Evidence was marked as unverified."
        )

        return Response(EvidenceSerializer(evidence).data)

    @action(detail=True, methods=["get"])
    def verify_integrity(self, request, pk=None):
        evidence = self.get_object()

        if not evidence.file:
            return Response(
                {
                    "integrity": False,
                    "integrity_status": "no_file",
                    "message": "This evidence does not have a file."
                },
                status=400
            )

        if not evidence.file.storage.exists(evidence.file.name):
            return Response(
                {
                    "integrity": False,
                    "integrity_status": "file_missing",
                    "message": "The evidence file is missing from storage."
                },
                status=404
            )

        current_hash = evidence.generate_file_hash()

        if not evidence.file_hash:
            evidence.file_hash = current_hash
            evidence.save(update_fields=["file_hash"])

            EvidenceActivity.objects.create(
                evidence=evidence,
                user=request.user,
                action="integrity_check",
                description="File integrity hash was generated and stored."
            )

            return Response(
                {
                    "integrity": True,
                    "integrity_status": "hash_created",
                    "message": "File hash generated and stored successfully.",
                    "stored_hash": evidence.file_hash,
                    "current_hash": current_hash
                }
            )

        is_valid = current_hash == evidence.file_hash

        if is_valid:
            activity_description = (
                "File integrity check completed successfully. "
                "The SHA-256 hash matches the stored hash."
            )
        else:
            activity_description = (
                "File integrity check detected a hash mismatch. "
                "The file may have been modified."
            )

        EvidenceActivity.objects.create(
            evidence=evidence,
            user=request.user,
            action="integrity_check",
            description=activity_description
        )

        return Response(
            {
                "integrity": is_valid,
                "integrity_status": "verified" if is_valid else "tampered",
                "message": (
                    "Evidence file integrity verified successfully."
                    if is_valid
                    else "Warning: This evidence file may have been modified."
                ),
                "stored_hash": evidence.file_hash,
                "current_hash": current_hash
            }
        )

    @action(detail=True, methods=["get"])
    def chain_of_custody(self, request, pk=None):
        evidence = self.get_object()

        activities = evidence.activities.select_related("user").all()

        data = []

        for activity in activities:
            data.append(
                {
                    "id": activity.id,
                    "action": activity.action,
                    "action_label": activity.get_action_display(),
                    "description": activity.description,
                    "user": (
                        activity.user.username
                        if activity.user
                        else "Unknown"
                    ),
                    "created_at": activity.created_at,
                }
            )

        return Response(
            {
                "evidence_id": evidence.id,
                "evidence_title": evidence.title,
                "activities": data,
            }
        )