from rest_framework import serializers
from .models import Suspect


class SuspectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suspect
        fields = [
            "id",
            "case",
            "name",
            "age",
            "occupation",
            "status",
            "description",
            "photo",
            "created_at",
        ]
        read_only_fields = [
            "created_at",
        ]