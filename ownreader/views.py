from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse
from ownreader.models import UserItem, UserPrefs
from ownreader.tasks import CeleryUpdater
from ownreader.forms import MarkAllReadFormSet
from django.core.paginator import Paginator, EmptyPage


@ensure_csrf_cookie
def index(request):
    if not request.user.is_authenticated():
        return render(request, 'ownreader/welcome.html')

    showRead = request.POST.get('showRead', None)
    pageSize = request.POST.get('pageSize', None)
    newestItem = request.POST.get('newest', None)
    adding = request.POST.get('adding', False)
    page = request.POST.get('page', 1)
    selected = request.POST.get('selected', None)

    if page != 1:
        page = int(page)

    #Grab the current user's preferences for the layout
    prefs = None
    try:
        prefs = UserPrefs.objects.get(user=request.user)
    except:
        pass
    if prefs is None:
        prefs = UserPrefs(user=request.user)
        prefs.save()

    #Apply the user preferences if we didn't get POST specifics
    if showRead is None:
        showRead = prefs.showRead
    elif showRead == "True":
        showRead = True
    else:
        showRead = False

    if pageSize is not None:
        try:
            pageSize = int(pageSize)
        except:
            pass

    if pageSize is None:
        pageSize = prefs.itemsPerPage


    #Grab the items to show, depending on read status preference
    items = UserItem.objects.select_related('item').filter(
                user=request.user
            ).order_by(
                '-item__published')

    if not showRead:
        items = items.filter(read=False)

    #Ensure updates don't alter items' places in the page
    if newestItem is not None:
        try:
            newestItem = int(newestItem)
            latestUserItem = UserItem.objects.get(pk=newestItem)
            latestItem = latestUserItem.item
            items = items.filter(item__published__lte=latestItem.published)
        except:
            pass

    #Chose which item to display in the preview
    if selected is not None:
        try:
            selected = items[int(selected)]
        except:
            selected = None
    if selected is None and len(items) > 0:
        selected = items[0]


    #Paginate the items, check if a particular page was requested
    paginator = Paginator(items, pageSize)
    currentItems = None;
    try:
        currentItems = paginator.page(page)
    except EmptyPage:
        currentItems = paginator.page(paginator.num_pages)
    except:
        pass
    if currentItems is None:
        currentItems = paginator.page(1)

    if adding is False:
        formsetItems = items.filter(id__in=[item.id for item in currentItems])
    else:
        allPages = Paginator(items, pageSize*page)
        currItems = allPages.page(1)
        formsetItems = items.filter(id__in=[item.id for item in currItems])

    allItems = MarkAllReadFormSet(queryset=formsetItems)

    context = {'items': currentItems,
               'formset': allItems,
               'prefs': prefs,
               'selected': selected}
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


def toggleShowRead(request):
    if request.user.is_authenticated():
        prefs = UserPrefs.objects.get(user=request.user)
        if prefs.showRead:
            prefs.showRead = False
        else:
            prefs.showRead = True
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

