import hashlib

from django.contrib.auth.models import User
from django.db import models

from cases.models import Case


class Evidence(models.Model):
    TYPE_CHOICES = [
        ("document", "Document"),
        ("image", "Image"),
        ("video", "Video"),
        ("audio", "Audio"),
        ("physical", "Physical"),
        ("digital", "Digital"),
        ("other", "Other"),
    ]

    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="evidence"
    )

    title = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    evidence_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES
    )

    file = models.FileField(
        upload_to="evidence/",
        blank=True,
        null=True
    )

    file_hash = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        editable=False
    )

    verified = models.BooleanField(default=False)

    collected_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="collected_evidence"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def generate_file_hash(self):
        if not self.file:
            return None

        sha256 = hashlib.sha256()

        file_object = self.file.file

        current_position = file_object.tell()

        file_object.seek(0)

        for chunk in iter(lambda: file_object.read(8192), b""):
            sha256.update(chunk)

        file_object.seek(current_position)

        return sha256.hexdigest()

    def save(self, *args, **kwargs):
        if self.file and not self.file_hash:
            self.file_hash = self.generate_file_hash()

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class EvidenceActivity(models.Model):
    ACTION_CHOICES = [
        ("uploaded", "Uploaded"),
        ("verified", "Verified"),
        ("unverified", "Marked Unverified"),
        ("integrity_check", "Integrity Checked"),
        ("updated", "Updated"),
        ("deleted", "Deleted"),
    ]

    evidence = models.ForeignKey(
        Evidence,
        on_delete=models.CASCADE,
        related_name="activities"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="evidence_activities"
    )

    action = models.CharField(
        max_length=30,
        choices=ACTION_CHOICES
    )

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.evidence.title} - {self.action}"