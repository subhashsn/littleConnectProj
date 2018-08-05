// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'onezone-datepicker', 'ion-gallery', 'pickadate'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })
  .state('app.dashboard', {
      url: '/dashboard',
      views: {
          'menuContent': {
              templateUrl: 'templates/playlists.html',
              controller: 'PlaylistsCtrl'
          }
      },
      resolve: {
          init: function () {
              hideMenuClick();
          }
      }
  })
  .state('app.gallerylist', {
      url: '/gallerylist',
      views: {
          'menuContent': {
              templateUrl: 'templates/gallery-list.html'
          }
      }
      ,
      resolve: {
          init: function () {
              hideMenuClick();
          }
      }
  })
  .state('app.gallery', {
      url: '/gallery',
      views: {
          'menuContent': {
              templateUrl: 'templates/gallery.html'
          }
      }
      ,
      resolve: {
          init: function () {
              hideMenuClick();
          }
      }
  })
  .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html'
  })
  .state('logout', {
      url: '/logout',
      templateUrl: 'templates/login.html',
      resolve: {
          init: function () {
              if ($("#hasVideo").val() == "" || $("#hasVideo").val() == undefined) {
                  $("#enquiryVideoTab").hide();
                  $(".otpEnq").show();
                  if ($("#hasOtp").val() == "false") {
                      $(".otpEnq").hide();
                      $(".nototp").show();
                  }
              }
              else {
                  $("#enquiryVideoTab").show();
                  $(".otpEnq").hide();
                  $(".nototp").hide();
              }
              localStorage.setItem("isLogiedIn", "null");
          }
      }
  })
    .state('app.sms', {
        url: '/sms',
        views: {
            'menuContent': {
                templateUrl: 'templates/sms.html'
            }
        },
        resolve: {
            init: function () {
                hideMenuClick();
            }
        }
    })
    .state('app.mail', {
        url: '/mail',
        views: {
            'menuContent': {
                templateUrl: 'templates/mail.html',
                controller: 'emailsCtrl'

            }
        },
        resolve: {
            init: function () {
                hideMenuClick();
            }
        }
    })
  .state('app.calendar', {
      url: '/calendar',
      views: {
          'menuContent': {
              templateUrl: 'templates/calendar.html',
              controller: 'PlaylistsCtrl'
          }
      },
      resolve: {
          init: function () {
              hideMenuClick();
          }
      }
  }).state('app.eventdetails', {
      url: '/eventdetails',
      views: {
          'menuContent': {
              templateUrl: 'templates/event-details.html',
              controller: 'PlaylistsCtrl'
          }
      },
      resolve: {
          init: function () {
              hideMenuClick();
          }
      }
  })
  .state('app.enquiry', {
      url: '/enquiry',
      views: {
          'menuContent': {
              //templateUrl: 'templates/QRAttendence.html',
              templateUrl: 'templates/enquiry.html',
              controller: 'PlaylistsCtrl'
          }
      },
      resolve: {
          init: function () {
              hideMenuClick();
          }
      }
  })
  .state('app.settings', {
      url: '/settings',
      views: {
          'menuContent': {
              templateUrl: 'templates/settings.html',
              controller: 'PlaylistsCtrl'
          }
      },
      resolve: {
          init: function () {
              hideMenuClick();
          }
      }
  })
        .state('notificationcenter', {
            url: '/notificationcenter',
            templateUrl: 'templates/notificationcenter.html',
            controller: 'AppCtrl',
            resolve: {
                init: function () {
                    hideMenuClick();
                }
            }
        })
    .state('app.contact', {
        url: '/contact',
        views: {
            'menuContent': {
                templateUrl: 'templates/contact.html',
                controller: 'PlaylistsCtrl'
            }
        },
        resolve: {
            init: function () {
                hideMenuClick();
            }
        }
    })
    .state('app.chat', {
        url: '/chat',
        views: {
            'menuContent': {
                templateUrl: 'templates/chat.html',
                controller: 'PlaylistsCtrl'
            }
        },
        resolve: {
            init: function () {
                hideMenuClick();
            }
        }
    })
    .state('app.chatwindow', {
        url: '/chatwindow',
        views: {
            'menuContent': {
                templateUrl: 'templates/chatWindow.html',
                controller: 'PlaylistsCtrl'
            }
        },
        resolve: {
            init: function () {
                hideMenuClick();
            }
        }
    })
  .state('app.attendance', {
      url: '/attendance',
      views: {
          'menuContent': {
              templateUrl: 'templates/classwiseAttendance.html', //Attendance.html',
              controller: 'PlaylistsCtrl',
              resolve: {
                  init: function () {
                      setTimeout(function () {
                          if (localStorage.getItem("isAdmin") == "true") {
                              angular.element(document.querySelectorAll(".student_attendance")).css("display", "none");
                              angular.element(document.querySelectorAll(".admin-attendance")).css("display", "block");
                          }
                          else {
                              angular.element(document.querySelectorAll(".student_attendance")).css("display", "block");
                              angular.element(document.querySelectorAll(".admin-attendance")).css("display", "none");
                          }
                          hideMenuClick();
                      }, 500);
                  }
              }
          }
      },
      resolve: {
          init: function () {
              hideMenuClick();
          }
      }
  }).state('app.fee', {
      url: '/feeManagement',
      views: {
          'menuContent': {
              templateUrl: 'templates/feeManagement.html'
          }
      },
      resolve: {
          init: function () {
              hideMenuClick();
          }
      }
  }).state('app.noticeBoard', {
      url: '/noticeBoard',
      views: {
          'menuContent': {
              templateUrl: 'templates/noticeBoard.html'
          }
      },
      resolve: {
          init: function () {
              hideMenuClick();
          }
      }
  });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
})
.config(function (ionGalleryConfigProvider) {
    ionGalleryConfigProvider.setGalleryConfig({
        action_label: 'Close',
        toggle: false,
        row_size: 1,
        fixed_row_size: true
    });
});


/*hide menu clicks start*/
function hideMenuClick() {
    setTimeout(function () {
        if ($("ion-side-menu").css("z-index") == 0) {
            $(".ion-navicon").click();
        }
    }, 100);
}
/*hide menu clicks end*/