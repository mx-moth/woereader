from django.shortcuts import render, redirect
import time
from ownreader.models import UserItem
from ownreader.tasks import CeleryUpdater


def index(request):
    if not request.user.is_authenticated():
        return render(request, 'ownreader/welcome.html')
    else:
        items = UserItem.objects.filter(user=request.user).order_by(
            '-item__published')
        context = {'items': []}
        for item in items:
            item = item.item
            context['items'].append({
                'link': item.url, 'title': item.title,
                'summary': item.content})
        return render(request, 'ownreader/index.html', context)


def update(request):
    if not request.user.is_authenticated():
        return render(request, 'ownreader/welcome.html')
    else:
        CeleryUpdater.delay(request.user)
        return redirect('/')
