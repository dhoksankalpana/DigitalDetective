from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Suspect
from .serializers import SuspectSerializer


class SuspectViewSet(viewsets.ModelViewSet):
    queryset = Suspect.objects.all().order_by("-created_at")
    serializer_class = SuspectSerializer
    permission_classes = [IsAuthenticated]