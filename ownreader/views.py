from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse
from ownreader.models import UserItem
from ownreader.models import UserPrefs
from ownreader.tasks import CeleryUpdater
from ownreader.forms import MarkAllReadFormSet
from django.core.paginator import Paginator, EmptyPage


@ensure_csrf_cookie
def index(request):
    if not request.user.is_authenticated():
        return render(request, 'ownreader/welcome.html')
    else:
        #Grab the current user's preferences for the layout
        prefs = None
        try:
            prefs = UserPrefs.objects.get(user=request.user)
        except:
            pass
        if prefs is None:
            prefs = UserPrefs(user=request.user)
            prefs.save()

        #Grab the items to show, depending on read status preference
        if prefs.showUnread:
            items = UserItem.objects.select_related('item').filter(
                user=request.user
            ).order_by(
                '-item__published')
        else:
            items = UserItem.objects.select_related('item').filter(
                user=request.user
            ).filter(
                read=False
            ).order_by(
                '-item__published')

        #Paginate the items, check if a particular page was requested
        paginator = Paginator(items, 25)
        currentItems = None;
        try:
            page = request.POST['page']
        except:
            page = 1;
        try:
            currentItems = paginator.page(page)
        except EmptyPage:
            currentItems = paginator.page(paginator.num_pages)
        except:
            pass
        if currentItems is None:
            currentItems = paginator.page(1)

        formsetItems = items.filter(id__in=[item.id for item in currentItems])
        allItems = MarkAllReadFormSet(queryset=formsetItems)

        context = {'items': currentItems,
                   'formset': allItems,
                   'showUnread': prefs.showUnread,
                   'viewMode': prefs.viewMode,
                   'showSidebar': prefs.showSidebar}
        return render(request, 'ownreader/index.html', context)


def update(request):
    if request.user.is_authenticated():
        CeleryUpdater.delay(request.user)
    return redirect('/')


#Marks an item with the read status requested if one is given, else toggles
def toggleRead(request):
    if request.user.is_authenticated():
        if request.method == "POST":
            item = None
            read = None
            try:
                item = UserItem.objects.get(pk=request.POST['id'])
            except:
                pass
            try:
                read = request.POST['read']
            except:
                pass
            if item is not None and item.user == request.user:
                if read is not None:
                    if read == "True":
                        item.read = True
                    elif read == "False":
                        item.read = False
                else:
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

