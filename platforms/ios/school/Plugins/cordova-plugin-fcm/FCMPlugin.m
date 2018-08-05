#include <sys/types.h>
#include <sys/sysctl.h>

#import "AppDelegate+FCMPlugin.h"

#import <Cordova/CDV.h>
#import "FCMPlugin.h"
#import "Firebase.h"

@interface FCMPlugin () {}
@end

@implementation FCMPlugin

static BOOL notificatorReceptorReady = NO;
static BOOL appInForeground = YES;

static NSString *notificationCallback = @"FCMPlugin.onNotificationReceived";
static NSString *tokenRefreshCallback = @"FCMPlugin.onTokenRefreshReceived";
static FCMPlugin *fcmPluginInstance;
NSString *databasePath;
sqlite3 *pushNotificationDB;
NSMutableDictionary * pushNotificationDic;
NSMutableArray * pushNotificationArr;

+ (FCMPlugin *) fcmPlugin {
    
    return fcmPluginInstance;
}

- (void) ready:(CDVInvokedUrlCommand *)command
{
    NSLog(@"Cordova view ready");
    fcmPluginInstance = self;
    [self.commandDelegate runInBackground:^{
        
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
    
}

// GET TOKEN //
- (void) getToken:(CDVInvokedUrlCommand *)command 
{
    NSLog(@"get Token");
    [self.commandDelegate runInBackground:^{
        NSString* token = [[FIRInstanceID instanceID] token];
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:token];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

// UN/SUBSCRIBE TOPIC //
- (void) subscribeToTopic:(CDVInvokedUrlCommand *)command 
{
    NSString* topic = [command.arguments objectAtIndex:0];
    NSLog(@"subscribe To Topic %@", topic);
    [self.commandDelegate runInBackground:^{
        if(topic != nil)[[FIRMessaging messaging] subscribeToTopic:[NSString stringWithFormat:@"/topics/%@", topic]];
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:topic];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void) unsubscribeFromTopic:(CDVInvokedUrlCommand *)command 
{
    NSString* topic = [command.arguments objectAtIndex:0];
    NSLog(@"unsubscribe From Topic %@", topic);
    [self.commandDelegate runInBackground:^{
        if(topic != nil)[[FIRMessaging messaging] unsubscribeFromTopic:[NSString stringWithFormat:@"/topics/%@", topic]];
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:topic];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void) registerNotification:(CDVInvokedUrlCommand *)command
{
    NSLog(@"view registered for notifications");
    
    notificatorReceptorReady = YES;
    NSData* lastPush = [AppDelegate getLastPush];
    if (lastPush != nil) {
        [FCMPlugin.fcmPlugin notifyOfMessage:lastPush];
    }
    
    CDVPluginResult* pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void) notifyOfMessage:(NSData *)payload
{
    NSString *JSONString = [[NSString alloc] initWithBytes:[payload bytes] length:[payload length] encoding:NSUTF8StringEncoding];
    NSString * notifyJS = [NSString stringWithFormat:@"%@(%@);", notificationCallback, JSONString];
    NSLog(@"stringByEvaluatingJavaScriptFromString %@", notifyJS);
    
    if ([self.webView respondsToSelector:@selector(stringByEvaluatingJavaScriptFromString:)]) {
        [(UIWebView *)self.webView stringByEvaluatingJavaScriptFromString:notifyJS];
    } else {
        [self.webViewEngine evaluateJavaScript:notifyJS completionHandler:nil];
    }
}

-(void) notifyOfTokenRefresh:(NSString *)token
{
    NSString * notifyJS = [NSString stringWithFormat:@"%@('%@');", tokenRefreshCallback, token];
    NSLog(@"stringByEvaluatingJavaScriptFromString %@", notifyJS);
    
    if ([self.webView respondsToSelector:@selector(stringByEvaluatingJavaScriptFromString:)]) {
        [(UIWebView *)self.webView stringByEvaluatingJavaScriptFromString:notifyJS];
    } else {
        [self.webViewEngine evaluateJavaScript:notifyJS completionHandler:nil];
    }
}

-(void) appEnterBackground
{
    NSLog(@"Set state background");
    appInForeground = NO;
}

-(void) appEnterForeground
{
    NSLog(@"Set state foreground");
    NSData* lastPush = [AppDelegate getLastPush];
    if (lastPush != nil) {
        [FCMPlugin.fcmPlugin notifyOfMessage:lastPush];
    }
    appInForeground = YES;
}

//Added FCM Custom Methods
- (void) getMessageBy:(CDVInvokedUrlCommand *)command
{
    
}

- (void) getAllNotifications:(CDVInvokedUrlCommand *)command
{
    [self.commandDelegate runInBackground:^{
        
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        NSString *documentsDirectory = [paths objectAtIndex:0];
        
        databasePath = [[NSString alloc]initWithString:[documentsDirectory stringByAppendingPathComponent:@"pushNotification.db"]];
        
        if (sqlite3_open([databasePath UTF8String], &pushNotificationDB) == SQLITE_OK)
        {
            NSString *queryStatement = [NSString stringWithFormat:@"SELECT id ,message, flag, title, messageDate, messageId, extraData FROM PUSHNOTIFICATION"];
            
            sqlite3_stmt *statement;
            if (sqlite3_prepare_v2(pushNotificationDB, [queryStatement UTF8String], -1, &statement, NULL) == SQLITE_OK)
            {
                pushNotificationArr = [[NSMutableArray alloc]init];
                while (sqlite3_step(statement) == SQLITE_ROW) {
                    pushNotificationDic = [[NSMutableDictionary alloc]init];
                    
                    [pushNotificationDic setValue:[[NSString alloc] initWithUTF8String:(const char *) sqlite3_column_text(statement, 0)] forKey:@"id"];
                    [pushNotificationDic setValue:[[NSString alloc] initWithUTF8String:(const char *) sqlite3_column_text(statement, 1)] forKey:@"message"];
                    [pushNotificationDic setValue:[[NSString alloc] initWithUTF8String:(const char *) sqlite3_column_text(statement, 2)] forKey:@"title"];
                    [pushNotificationDic setValue:[[NSString alloc] initWithUTF8String:(const char *) sqlite3_column_text(statement, 3)] forKey:@"messageDate"];
                    [pushNotificationDic setValue:[[NSString alloc] initWithUTF8String:(const char *) sqlite3_column_text(statement, 4)] forKey:@"messageId"];
                    [pushNotificationDic setValue:[[NSString alloc] initWithUTF8String:(const char *) sqlite3_column_text(statement, 4)] forKey:@"extraData"];
                    [pushNotificationArr addObject:pushNotificationDic];
                    //NSLog(@"message: %s messagedate: %s", sqlite3_column_text(statement, 0), sqlite3_column_text(statement, 1));
                }
                sqlite3_finalize(statement);
                sqlite3_close(pushNotificationDB);
                if(pushNotificationArr.count <1)
                {
                    pushNotificationArr = NULL;
                }
            }
        }
        
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void) markInboxMessageRead:(CDVInvokedUrlCommand *)command
{
    [self.commandDelegate runInBackground:^{
        
        NSString *messageID = [command.arguments firstObject];
        int messageid = messageID.integerValue;
        sqlite3_stmt *statement = NULL;
        NSString *success = @"false";
        
        const char *dbpath = [databasePath UTF8String];
        
        if (sqlite3_open(dbpath, &pushNotificationDB) == SQLITE_OK)
        {
            if (messageID > 0) {
                NSLog(@"Exitsing data, Update Please");
                NSString *updateSQL = [NSString stringWithFormat:@"UPDATE PUSHNOTIFICATION set flag = 'true' WHERE id = ?"];
                
                const char *update_stmt = [updateSQL UTF8String];
                sqlite3_prepare_v2(pushNotificationDB, update_stmt, -1, &statement, NULL );
                sqlite3_bind_int(statement, 1, messageid);
                if (sqlite3_step(statement) == SQLITE_DONE)
                {
                    success = @"true";
                }
                
            }
            sqlite3_finalize(statement);
            sqlite3_close(pushNotificationDB);
        }
        
        CDVPluginResult* pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void) clearNotificationByNotificationId:(CDVInvokedUrlCommand *)command
{
    
}

@end
