from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse
from ownreader.models import UserItem
from ownreader.models import UserPrefs
from ownreader.tasks import CeleryUpdater
from ownreader.forms import MarkAllReadFormSet


@ensure_csrf_cookie
def index(request):
    if not request.user.is_authenticated():
        return render(request, 'ownreader/welcome.html')
    else:
        prefs = None
        try:
            prefs = UserPrefs.objects.get(user=request.user)
        except:
            pass
        if prefs is None:
            prefs = UserPrefs(user=request.user)
            prefs.save()
        if prefs.showUnread:
            items = UserItem.objects.filter(
                user=request.user
            ).order_by(
                '-item__published')
        else:
            items = UserItem.objects.filter(
                user=request.user
            ).filter(
                read=False
            ).order_by(
                '-item__published')
        allItems = MarkAllReadFormSet(queryset=items)
        context = {'items': [],
                   'formset': allItems,
                   'showUnread': prefs.showUnread,
                   'viewMode': prefs.viewMode,
                   'showSidebar': prefs.showSidebar}
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
    if request.user.is_authenticated():
        CeleryUpdater.delay(request.user)
    return redirect('/')


def toggleRead(request):
    if request.user.is_authenticated():
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
    return redirect('/')


def markRead(request):
    if request.user.is_authenticated():
        if request.method == "POST":
            allItems = MarkAllReadFormSet(request.POST)
            instances = allItems.save(commit=False)
            for instance in instances:
                instance.read = True
                instance.save()
    return redirect('/')


def toggleUnread(request):
    if request.user.is_authenticated():
        prefs = UserPrefs.objects.get(user=request.user)
        if prefs.showUnread:
            prefs.showUnread = False
        else:
            prefs.showUnread = True
        prefs.save()
    return redirect('/')


def toggleSidebar(request):
    if request.user.is_authenticated():
        try:
            prefs = UserPrefs.objects.get(user=request.user)
        except:
            pass
        if request.method == "POST":
            if request.POST.get('showSidebar') == 'toggle':
                prefs.showSidebar = bool(not prefs.showSidebar)
                prefs.save()
            return HttpResponse(201)
        else:
            prefs.showSidebar = bool(not prefs.showSidebar)
            prefs.save()
    return redirect('/')

