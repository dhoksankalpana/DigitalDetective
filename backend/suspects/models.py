from django.db import models
from cases.models import Case


class Suspect(models.Model):
    STATUS_CHOICES = [
        ("person_of_interest", "Person of Interest"),
        ("suspect", "Suspect"),
        ("cleared", "Cleared"),
        ("unknown", "Unknown"),
    ]

    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="suspects"
    )
    name = models.CharField(max_length=150)
    age = models.PositiveIntegerField(null=True, blank=True)
    occupation = models.CharField(max_length=150, blank=True)
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="unknown"
    )
    description = models.TextField(blank=True)
    photo = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name