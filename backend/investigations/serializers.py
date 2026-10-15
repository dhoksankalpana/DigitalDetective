from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers

from cases.models import Case

from .models import (
    Investigation,
    Clue,
    TimelineEvent,
    CaseNote,
    InvestigationTask,
)


class InvestigationSerializer(serializers.ModelSerializer):
    investigator_username = serializers.CharField(
        source="investigator.username",
        read_only=True
    )

    class Meta:
        model = Investigation
        fields = [
            "id",
            "case",
            "title",
            "findings",
            "investigator",
            "investigator_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "investigator",
            "created_at",
            "updated_at",
        ]


class ClueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clue
        fields = [
            "id",
            "case",
            "title",
            "description",
            "importance",
            "resolved",
            "created_at",
        ]
        read_only_fields = [
            "created_at",
        ]


class TimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEvent
        fields = [
            "id",
            "case",
            "title",
            "description",
            "event_date",
            "created_at",
        ]
        read_only_fields = [
            "created_at",
        ]


class CaseNoteSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(
        source="author.username",
        read_only=True
    )

    class Meta:
        model = CaseNote
        fields = [
            "id",
            "case",
            "author",
            "author_username",
            "content",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "author",
            "created_at",
            "updated_at",
        ]


class InvestigationTaskSerializer(serializers.ModelSerializer):
    case_title = serializers.CharField(
        source="case.title",
        read_only=True
    )

    case_number = serializers.CharField(
        source="case.case_number",
        read_only=True
    )

    assigned_to_username = serializers.CharField(
        source="assigned_to.username",
        read_only=True,
        allow_null=True
    )

    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = InvestigationTask
        fields = [
            "id",
            "case",
            "case_title",
            "case_number",
            "title",
            "description",
            "assigned_to",
            "assigned_to_username",
            "priority",
            "status",
            "due_date",
            "created_at",
            "completed_at",
            "is_overdue",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "completed_at",
            "is_overdue",
        ]

    def validate_case(self, value):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        user = request.user

        has_access = Case.objects.filter(
            Q(created_by=user) | Q(assigned_to=user),
            pk=value.pk
        ).exists()

        if not has_access:
            raise serializers.ValidationError(
                "You can only create tasks for cases you can access."
            )

        return value

    def get_is_overdue(self, obj):
        return (
            obj.due_date is not None
            and obj.due_date < timezone.localdate()
            and obj.status not in ["completed", "cancelled"]
        )