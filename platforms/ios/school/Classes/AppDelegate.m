/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

//
//  AppDelegate.m
//  school
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  Copyright ___ORGANIZATIONNAME___ ___YEAR___. All rights reserved.
//

#import "AppDelegate.h"
#import "MainViewController.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{
    self.viewController = [[MainViewController alloc] init];
    return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

-(void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    NSLog(@"didReceiveRemoteNotification");
    NSString * aps = [userInfo objectForKey:@"aps"];
    NSString *alterTittle = [aps valueForKey:@"alert"];
//    NSString *UserId = [userInfo valueForKey:@"UserId"];
    NSString *title = [userInfo valueForKey:@"title"];
    NSString *messageId = [userInfo valueForKey:@"messageId"];
    NSString *ExtraData = [userInfo valueForKey:@"body"];
    // UIApplicationState state = [[UIApplication sharedApplication] applicationState];
    
    /*if ([UserId isEqual: @"0"])
    {
    }else
    {*/
    [self insertIntDBwithMessage:alterTittle title:title messageId:messageId extraData:ExtraData];
    //}
    // UIApplicationState state = [[UIApplication sharedApplication] applicationState];
    
    // [UAAppIntegration application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

#pragma mark - SQLite
-(void)createDatabase
{
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    
    databasePath = [[NSString alloc]initWithString:[documentsDirectory stringByAppendingPathComponent:@"pushNotification.db"]];
    
    if ([[NSFileManager defaultManager] fileExistsAtPath:databasePath] == FALSE)
    {
        if (sqlite3_open([databasePath UTF8String], &pushNotificationDB) == SQLITE_OK)
        {
            const char *sqlStatement = "CREATE TABLE IF NOT EXISTS PUSHNOTIFICATION (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT, flag TEXT, title TEXT, messageDate TEXT, messageId TEXT, messageBy TEXT, extraData TEXT)";
            char *error;
            sqlite3_exec(pushNotificationDB, sqlStatement, NULL, NULL, &error);
            sqlite3_close(pushNotificationDB);
        } else {
            
            NSLog(@"Failed to open/create database");
        }
    }
}

-(void)insertIntDBwithMessage:(NSString *)message title:(NSString*)title messageId:(NSString*)messageId extraData:(NSString*)extraData
{
    if (sqlite3_open([databasePath UTF8String], &pushNotificationDB) == SQLITE_OK)
    {
        NSDateFormatter *dateFormatter=[[NSDateFormatter alloc] init];
        [dateFormatter setDateFormat:@"yyyy-MM-dd hh:mma"];
        NSString *dateString =   [dateFormatter stringFromDate:[NSDate date]];
        
        NSString *insertStatement = [NSString stringWithFormat:@"INSERT INTO PUSHNOTIFICATION (message, flag, title, messageDate, messageId, extraData) VALUES (\"%@\", \"%@\" ,\"%@\" ,\"%@\" ,\"%@\" ,\"%@\")", message, @"false",title,dateString,messageId,extraData];
        
        char *error;
        sqlite3_exec(pushNotificationDB, [insertStatement UTF8String], NULL, NULL, &error);
        sqlite3_close(pushNotificationDB);
        
    }
}

@end
