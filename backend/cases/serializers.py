from rest_framework import serializers
from .models import Case
from .models import CrimeScenePosition


class CaseSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(
        source="assigned_to.username",
        read_only=True
    )
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    class Meta:
        model = Case
        fields = [
            "id",
            "title",
            "case_number",
            "description",
            "status",
            "priority",
            "location",
            "assigned_to",
            "assigned_to_username",
            "created_by",
            "created_by_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "created_by",
            "created_at",
            "updated_at",
        ]
class CrimeScenePositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrimeScenePosition
        fields = [
            "id",
            "case",
            "marker_id",
            "left",
            "top",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]