from django.contrib import admin
from ownreader.models import Feed, UserFeed, Item, UserItem, Folder


admin.site.register(Feed)
admin.site.register(UserFeed)
admin.site.register(Item)
admin.site.register(UserItem)
admin.site.register(Folder)
