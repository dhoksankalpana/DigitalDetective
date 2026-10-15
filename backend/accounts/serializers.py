from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile",
        ]

    def get_profile(self, obj):
        try:
            profile = obj.profile

            return {
                "id": profile.id,
                "display_name": profile.display_name,
                "role": profile.role,
                "avatar": profile.avatar,
                "bio": profile.bio,
            }

        except UserProfile.DoesNotExist:
            return {
                "id": None,
                "display_name": "",
                "role": "",
                "avatar": "",
                "bio": "",
            }


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "user",
            "display_name",
            "role",
            "avatar",
            "bio",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    password_confirm = serializers.CharField(
        write_only=True
    )

    display_name = serializers.CharField(
        write_only=True
    )

    role = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
            "display_name",
            "role",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match."
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        display_name = validated_data.pop("display_name")
        role = validated_data.pop("role")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        UserProfile.objects.create(
            user=user,
            display_name=display_name,
            role=role
        )

        return user