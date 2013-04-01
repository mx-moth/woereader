from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse
from ownreader.models import UserItem
from ownreader.tasks import CeleryUpdater


@ensure_csrf_cookie
def index(request):
    if not request.user.is_authenticated():
        return render(request, 'ownreader/welcome.html')
    else:
        items = UserItem.objects.filter(user=request.user).order_by(
            '-item__published')
        context = {'items': []}
        for uitem in items:
            item = uitem.item
            context['items'].append({
                'id': uitem.pk,
                'read': uitem.read,
                'link': item.url,
                'title': item.title,
                'summary': item.content})
        return render(request, 'ownreader/index.html', context)


def update(request):
    if not request.user.is_authenticated():
        return render(request, 'ownreader/welcome.html')
    else:
        CeleryUpdater(request.user)
        return redirect('/')


def toggleRead(request):
    if request.method == "POST":
        item = None
        try:
            item = UserItem.objects.get(pk=request.POST['id'])
        except:
            pass
        if item is not None and item.user == request.user:
            if item.read:
                item.read = False
            else:
                item.read = True
            item.save()
        return HttpResponse(201)
    else:
        return HttpResponse(404)
