from django.contrib import admin
from ownreader.models import Feed, UserFeed, Item, UserItem, Folder


class FeedAdmin(admin.ModelAdmin):
    list_display = ('title', 'url', 'updated', 'checked', 'etag',
                    'description')

admin.site.register(Feed, FeedAdmin)


class UserFeedAdmin(admin.ModelAdmin):
    list_display = ('gettitle', 'user', 'customTitle', 'customDescription')

    def gettitle(self, obj):
        return '%s' % (obj.feed.title)
    gettitle.short_description = 'Feed Name'
    gettitle.admin_order_field = 'feed__title'
admin.site.register(UserFeed, UserFeedAdmin)


class ItemAdmin(admin.ModelAdmin):
    list_display = ('gettitle', 'title', 'itemId', 'url', 'published')

    def gettitle(self, obj):
        return '%s' % (obj.feed.title)
    gettitle.short_description = 'Feed Name'
    gettitle.admin_order_field = 'feed__title'
admin.site.register(Item, ItemAdmin)


class UserItemAdmin(admin.ModelAdmin):
    list_display = ('gettitle', 'getfeed', 'read', 'user', 'item')

    def gettitle(self, obj):
        return '%s' % (obj.item.title)
    gettitle.short_description = 'Item Title'
    gettitle.admin_order_field = 'item__title'

    def getfeed(self, obj):
        return '%s' % (obj.item.feed.title)
    getfeed.short_description = 'Feed title'
    getfeed.admin_order_field = 'item__feed__title'
admin.site.register(UserItem, UserItemAdmin)
admin.site.register(Folder)
