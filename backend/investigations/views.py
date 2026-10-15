from django.db.models import Q
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import (
    Investigation,
    Clue,
    TimelineEvent,
    CaseNote,
    InvestigationTask,
)

from .serializers import (
    InvestigationSerializer,
    ClueSerializer,
    TimelineEventSerializer,
    CaseNoteSerializer,
    InvestigationTaskSerializer,
)


class InvestigationViewSet(viewsets.ModelViewSet):
    queryset = Investigation.objects.all().order_by("-created_at")
    serializer_class = InvestigationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(investigator=self.request.user)


class ClueViewSet(viewsets.ModelViewSet):
    queryset = Clue.objects.all().order_by("-created_at")
    serializer_class = ClueSerializer
    permission_classes = [IsAuthenticated]


class TimelineEventViewSet(viewsets.ModelViewSet):
    queryset = TimelineEvent.objects.all().order_by("event_date")
    serializer_class = TimelineEventSerializer
    permission_classes = [IsAuthenticated]


class CaseNoteViewSet(viewsets.ModelViewSet):
    queryset = CaseNote.objects.all().order_by("-created_at")
    serializer_class = CaseNoteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class InvestigationTaskViewSet(viewsets.ModelViewSet):
    serializer_class = InvestigationTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return (
            InvestigationTask.objects
            .filter(
                Q(case__created_by=user)
                | Q(case__assigned_to=user)
                | Q(assigned_to=user)
            )
            .select_related("case", "assigned_to")
            .order_by("-created_at")
            .distinct()
        )

    def perform_create(self, serializer):
        status_value = serializer.validated_data.get(
            "status",
            "pending"
        )

        completed_at = (
            timezone.now()
            if status_value == "completed"
            else None
        )

        serializer.save(
            completed_at=completed_at
        )

    def perform_update(self, serializer):
        current_status = serializer.validated_data.get(
            "status",
            serializer.instance.status
        )

        if current_status == "completed":
            completed_at = (
                serializer.instance.completed_at
                or timezone.now()
            )
        else:
            completed_at = None

        serializer.save(
            completed_at=completed_at
        )