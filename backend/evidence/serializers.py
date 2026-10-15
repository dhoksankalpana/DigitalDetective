from rest_framework import serializers

from .models import Evidence


class EvidenceSerializer(serializers.ModelSerializer):
    collected_by_username = serializers.CharField(
        source="collected_by.username",
        read_only=True
    )

    class Meta:
        model = Evidence
        fields = [
            "id",
            "case",
            "title",
            "description",
            "evidence_type",
            "file",
            "file_hash",
            "verified",
            "collected_by",
            "collected_by_username",
            "created_at",
        ]

        read_only_fields = [
            "file_hash",
            "collected_by",
            "created_at",
        ]