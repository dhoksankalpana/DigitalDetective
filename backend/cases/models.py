from django.contrib.auth.models import User
from django.db import models


class Case(models.Model):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("investigating", "Investigating"),
        ("closed", "Closed"),
        ("archived", "Archived"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    ]

    title = models.CharField(max_length=200)
    case_number = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium")
    location = models.CharField(max_length=255, blank=True)
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_cases"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_cases"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.case_number} - {self.title}"

class CrimeScenePosition(models.Model):
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="crime_scene_positions"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="crime_scene_positions"
    )

    marker_id = models.CharField(max_length=100)

    left = models.FloatField(default=50)
    top = models.FloatField(default=50)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("case", "user", "marker_id")
        ordering = ["marker_id"]

    def __str__(self):
        return f"{self.case.title} - {self.marker_id}"