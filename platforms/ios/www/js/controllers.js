/*global objects declarations*/
var calenderEventsList = [];
var studentDetails = [];
var monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var now = new Date();
var day = ("0" + now.getDate()).slice(-2);
var month = ("0" + (now.getMonth() + 1)).slice(-2);
var today = now.getFullYear() + "-" + (month) + "-" + (day);
var receiptList = [], showaddTemplate = false;;
var msgCount = 0;
var menusList = [], flag = 0;
var feeDetails = [];
var receiptsDetails = { rcvdAmt: 0, pendingAmt: 0, rcvdNo: 0 };
var roleId = 0;
var emails = [];
var receiptType = "";
var image_Extensions = new Array('.JPEG', '.JPG', '.GIF', '.PNG');
//var FCMAuthToken = "AIzaSyBE8-JE7ttmkfnbfFnW2QCZGNZKCjTFlwE";
var FCMAuthToken = "AIzaSyDs_S4PO1YAJt8QK6cLAUprmuj-4N97Ug0";
var dummyStudentList = [], getStudentsAttendenceData = [], parentContacts = [];

/*all controls defined here start*/
angular.module('starter.controllers', [])
.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $ionicModal, $ionicSlideBoxDelegate,
    $http, $state, dateFilter, $ionicHistory, $ionicScrollDelegate, $compile,$rootScope) {

    $scope.doRefresh = function (refresher) {
        $(".loader").show();
        console.log('Begin async operation', refresher);
        //$state.go(app.feed, {}, {reload: true});
        location.reload();
        $state.go($state.current, {}, { reload: true });
        //    $("input,textarea").val("");
        //    $("input[type='checkbox']").prop("checked",false);
        //    $scope.showaddAlbum=false;
        setTimeout(function () {
            console.log('Async operation has ended');
            $scope.$broadcast('scroll.refreshComplete');
            $(".loader").hide();
        }, 1000);
    }

    setInterval(function () {
        autoLoadMessaging($http);
    }, 2000);

    $scope.openNotificationCenter = function () {
        $state.go('notificationcenter', {}, { location: "replace", reload: true });
    }

    $scope.eventName = "";

    $scope.floatToggle = function () {
        $scope.floatContainer = !$scope.floatContainer;
    }

    $scope.shortCutViews = function (viewType) {
        if (viewType == 1) //1 for calendar
            $state.go('app.calendar');

        if (viewType == 2) //2 for sms
            $state.go('app.sms');

        if (viewType == 3) //3 for gallery
            $state.go('app.gallerylist');

        $scope.floatContainer = !$scope.floatContainer;
    }

    $scope.msgCount = 0;
    $scope.date = dateFilter(new Date(), 'yyyy-MM-dd');
    $scope.minDate = '2015-10-06';
    $scope.items = [];
    $scope.MessagingContacts = [];//contacts for messaging
    $scope.calenderEvent = today;
    /*login event start*/
    $scope.loginCheck = function () {
        if (localStorage.getItem("isLogiedIn") != "null" && localStorage.getItem("isLogiedIn") != null) {
            try {
                if (localStorage.getItem("schoolId") == null || localStorage.getItem("schoolId") == "" || localStorage.getItem("schoolId") == undefined || localStorage.getItem("schoolId").toString() == 'null') {
                    $state.go('app.login');
                    return false;
                }

                if (localStorage.getItem("schoolLogo") = null || localStorage.getItem("schoolLogo") == undefined) {
                    $state.go('app.login');
                    return false;
                }
            }
            catch (ex) { }
            $state.go('app.dashboard');
            angular.element(document.getElementsByClassName("toolImage")).attr("src", localStorage.getItem("schoolLogo"));
            $http({
                method: 'POST',
                url: services.MenuService,
                data: { roleID: localStorage.getItem("roleId"), isStaff: localStorage.getItem("isStaff") },
                //data: { roleID: localStorage.getItem("roleId") },
            }).success(function (data) {
                angular.element(document.getElementById("sms_tab")).css("display", "none");
                angular.element(document.getElementById("attendance_tab")).css("display", "none");
                angular.element(document.getElementById("email_tab")).css("display", "none");

                angular.element(document.getElementById("sms_tab1").parentElement).css("display", "none");
                angular.element(document.getElementById("attendance_tab1").parentElement).css("display", "none");
                angular.element(document.getElementById("email_tab1").parentElement).css("display", "none");
                var isFeeManagement = false;
                angular.forEach(data.d.MastersMenusItems, function (a, b) {
                    if (parseInt(a.Rights) > 0) {
                        var menuName = a.MenuItemType.toLowerCase();
                        var menuItemCaption = a.MenuItemCaption.toLowerCase();
                        if (menuName == "send sms")
                            menuName = "sms";
                        angular.element(document.getElementById(menuName + "_tab")).css("display", "block");
                        if (document.getElementById(menuName + "_tab1") != null)
                            angular.element(document.getElementById(menuName + "_tab1").parentElement).css("display", "block");
                        if (menuItemCaption == "send sms")
                            menuItemCaption = "sms";
                        if (menuItemCaption == "send email")
                            menuItemCaption = "email";
                        angular.element(document.getElementById(menuItemCaption + "_tab")).css("display", "block");
                        if (document.getElementById(menuItemCaption + "_tab1") != null)
                            angular.element(document.getElementById(menuItemCaption + "_tab1").parentElement).css("display", "block");
                        if (a.MenuItemType == "Fees Management")
                            isFeeManagement = true;
                    }
                });

                if (isFeeManagement && localStorage.getItem("isAdmin") == "true")
                    $("#feeManagement_tab").show();
                else
                    $("#feeManagement_tab").hide();

                angular.element(document.getElementById("accounts_tab")).css("display", "block");

                if (localStorage.getItem("isAdmin") == "true") {
                    $("#enquiry_tab,#enquiry_tab1").show();
                }
                else {
                    $("#enquiry_tab,#enquiry_tab1").hide();
                }

                $("#noticeBoard_tab").show();
                /*calling dashboard services start*/
                $http({
                    method: 'POST',
                    url: services.DashService,
                    data: { schoolId: localStorage.getItem("schoolId"), userId: localStorage.getItem("userId") },
                }).success(function (data) {
                    var eventsBinding = "";
                    angular.element(document.querySelectorAll("#latestEvents")).empty();
                    angular.element(document.querySelectorAll("#holidayDtls")).empty();
                    angular.forEach(data.d.CalendarDetails_List, function (_a, _b) {
                        eventsBinding = eventsBinding + '<td><div class="lc-col">';
                        eventsBinding = eventsBinding + '<div class="lc-header-text"> ' + _a.Title + ' </div>';
                        if (_a.FromDate == _a.ToDate)
                            eventsBinding = eventsBinding + '<p> ' + _a.FromDate + '</p>';
                        else
                            eventsBinding = eventsBinding + '<p> ' + _a.FromDate + '-' + _a.ToDate + '</p>';
                        eventsBinding = eventsBinding + ' <div class="lc-time"> ' + _a.Time + '</div>';
                        eventsBinding = eventsBinding + '</div></td>';
                    });
                    angular.element(document.querySelectorAll("#latestEvents")).append(eventsBinding);
                    eventsBinding = "";
                    angular.forEach(data.d.HolidayDetails_List, function (_a, _b) {
                        eventsBinding = eventsBinding + '<p class="row-1">' + _a.HolidayName + '</p>';
                        if (_a.StartDate == _a.EndDate)
                            eventsBinding = eventsBinding + '<p class="row-2">' + _a.StartDate + '</p>';
                        else
                            eventsBinding = eventsBinding + '<p class="row-2">' + _a.StartDate + '-' + _a.EndDate + '</p>';
                    });
                    angular.element(document.querySelectorAll("#holidayDtls")).append(eventsBinding);

                    var a = new Date(new Date());
                    angular.element(document.querySelectorAll("#currentDayName")).text((weekday[a.getDay()]));
                    angular.element(document.querySelectorAll("#currentMonth_Year")).text(monthsList[a.getMonth()] + ' ' + a.getFullYear());
                    angular.element(document.querySelectorAll("#currentDay")).text(a.getDate());

                    if (localStorage.getItem("isAdmin") == "true") {
                        $("#txtnames").html(localStorage.getItem("SchoolName"));
                        $("#txtadmission").hide();
                    }
                    else {
                        $("#txtnames").html(localStorage.getItem("StudentName"));
                        $("#txtadmission").html(localStorage.getItem("AdmissionNo"));
                        $("#txtadmission").show();
                    }
                    $(".user-img")[0].src = localStorage.getItem("schoolLogo");
                    if (localStorage.getItem("isAdmin") == "true") {
                        $("#enquiry_tab,#enquiry_tab1").show();
                    }
                    else {
                        $("#enquiry_tab,#enquiry_tab1").hide();
                    }
                    /*subscribe for notifications start*/
                    try {
                        if (window.cordova) {
                            if (localStorage.getItem("isAdmin") == "true") {
                                FCMPlugin.unsubscribeFromTopic(localStorage.getItem("schoolId") + "schoolId");
                                FCMPlugin.subscribeToTopic(localStorage.getItem("schoolId") + "schoolId");
                            }
                            else {
                                FCMPlugin.unsubscribeFromTopic(localStorage.getItem("studentId"));
                                FCMPlugin.subscribeToTopic(localStorage.getItem("studentId"));
                            }
                        }
                    }
                    catch (ex) { }
                    /*subscribe for notifications end*/
                }).error(function (data) {

                });
                /*calling dashboard services end*/
                angular.element(document.getElementsByClassName("toolImage")).attr("src", localStorage.getItem("schoolLogo"));
            }).error(function (data) { });
        }
    }

    $scope.doLogin = function (username, password) {
        $http({
            method: 'POST',
            url: services.LoginService,
            data: { MailID: username, PWD: password },
        }).success(function (data) {
            if (data.d.ResponseCode == 1 || data.d.ResponseCode == 2) {
                if (data.d.ResponseCode == 2)
                    localStorage.setItem("isStaff", true);
                else
                    localStorage.setItem("isStaff", false);

                localStorage.setItem("schoolLogo", data.d.ImageUrl);
                localStorage.setItem("isAdmin", data.d.IsAdmin);
                localStorage.setItem("mailId", data.d.MailID);
                localStorage.setItem("roleId", data.d.RoleID);
                localStorage.setItem("schoolId", data.d.SchoolID);
                localStorage.setItem("studentId", data.d.StudentID);
                localStorage.setItem("userId", data.d.UserID);
                localStorage.setItem("userName", data.d.UserName);
                localStorage.setItem("isLogiedIn", username);

                localStorage.setItem("SchoolName", data.d.SchoolName);
                localStorage.setItem("AdmissionNo", data.d.AdmissionNo);
                localStorage.setItem("StudentName", data.d.StudentName);

                $state.go('app.dashboard');
                angular.element(document.getElementsByClassName("toolImage")).attr("src", localStorage.getItem("schoolLogo"));

                $http({
                    method: 'POST',
                    url: services.MenuService,
                    data: { roleID: localStorage.getItem("roleId"), isStaff: localStorage.getItem("isStaff") },
                    //data: { roleID: localStorage.getItem("roleId") },
                }).success(function (data) {
                    angular.element(document.getElementById("sms_tab")).css("display", "none");
                    angular.element(document.getElementById("attendance_tab")).css("display", "none");
                    angular.element(document.getElementById("email_tab")).css("display", "none");

                    angular.element(document.getElementById("sms_tab1").parentElement).css("display", "none");
                    angular.element(document.getElementById("attendance_tab1").parentElement).css("display", "none");
                    angular.element(document.getElementById("email_tab1").parentElement).css("display", "none");

                    var isFeeManagement = false;
                    angular.forEach(data.d.MastersMenusItems, function (a, b) {
                        if (parseInt(a.Rights) > 0) {
                            var menuName = a.MenuItemType.toLowerCase();
                            var menuItemCaption = a.MenuItemCaption.toLowerCase();
                            if (menuName == "send sms")
                                menuName = "sms";
                            angular.element(document.getElementById(menuName + "_tab")).css("display", "block");
                            if (document.getElementById(menuName + "_tab1") != null)
                                angular.element(document.getElementById(menuName + "_tab1").parentElement).css("display", "block");
                            if (menuItemCaption == "send sms")
                                menuItemCaption = "sms";
                            if (menuItemCaption == "send email")
                                menuItemCaption = "email";
                            angular.element(document.getElementById(menuItemCaption + "_tab")).css("display", "block");
                            if (document.getElementById(menuItemCaption + "_tab1") != null)
                                angular.element(document.getElementById(menuItemCaption + "_tab1").parentElement).css("display", "block");
                            if (a.MenuItemType == "Fees Management")
                                isFeeManagement = true;
                        }
                    });

                    if (isFeeManagement && localStorage.getItem("isAdmin") == "true")
                        $("#feeManagement_tab").show();
                    else
                        $("#feeManagement_tab").hide();

                    angular.element(document.getElementById("accounts_tab")).css("display", "block");

                    if (localStorage.getItem("isAdmin") == "true") {
                        $("#enquiry_tab,#enquiry_tab1").show();
                    }
                    else {
                        $("#enquiry_tab,#enquiry_tab1").hide();
                    }

                    /*calling dashboard services start*/
                    $http({
                        method: 'POST',
                        url: services.DashService,
                        data: { schoolId: localStorage.getItem("schoolId"), userId: localStorage.getItem("userId") },
                    }).success(function (data) {

                        var eventsBinding = "";
                        angular.element(document.querySelectorAll("#latestEvents")).empty();
                        angular.element(document.querySelectorAll("#holidayDtls")).empty();
                        angular.forEach(data.d.CalendarDetails_List, function (_a, _b) {
                            eventsBinding = eventsBinding + '<td><div class="lc-col">';
                            eventsBinding = eventsBinding + '<div class="lc-header-text"> ' + _a.Title + ' </div>';
                            if (_a.FromDate == _a.ToDate)
                                eventsBinding = eventsBinding + '<p> ' + _a.FromDate + '</p>';
                            else
                                eventsBinding = eventsBinding + '<p> ' + _a.FromDate + '-' + _a.ToDate + '</p>';
                            eventsBinding = eventsBinding + ' <div class="lc-time"> ' + _a.Time + '</div>';
                            eventsBinding = eventsBinding + '</div></td>';
                        });
                        angular.element(document.querySelectorAll("#latestEvents")).append(eventsBinding);

                        eventsBinding = "";
                        angular.forEach(data.d.HolidayDetails_List, function (_a, _b) {
                            eventsBinding = eventsBinding + '<p class="row-1">' + _a.HolidayName + '</p>';
                            if (_a.StartDate == _a.EndDate)
                                eventsBinding = eventsBinding + '<p class="row-2">' + _a.StartDate + '</p>';
                            else
                                eventsBinding = eventsBinding + '<p class="row-2">' + _a.StartDate + '-' + _a.EndDate + '</p>';
                        });
                        angular.element(document.querySelectorAll("#holidayDtls")).append(eventsBinding);

                        var a = new Date(new Date());
                        angular.element(document.querySelectorAll("#currentDayName")).text((weekday[a.getDay()]));
                        angular.element(document.querySelectorAll("#currentMonth_Year")).text(monthsList[a.getMonth()] + ' ' + a.getFullYear());
                        angular.element(document.querySelectorAll("#currentDay")).text(a.getDate());

                        if (localStorage.getItem("isAdmin") == "true") {
                            $("#txtnames").html(localStorage.getItem("SchoolName"));
                            $("#txtadmission").hide();
                        }
                        else {
                            $("#txtnames").html(localStorage.getItem("StudentName"));
                            $("#txtadmission").html(localStorage.getItem("AdmissionNo"));
                            $("#txtadmission").show();
                        }
                        $(".user-img")[0].src = localStorage.getItem("schoolLogo");
                        if (localStorage.getItem("isAdmin") == "true") {
                            $("#enquiry_tab,#enquiry_tab1").show();
                        }
                        else {
                            $("#enquiry_tab,#enquiry_tab1").hide();
                        }

                        /*subscribe for notifications start*/
                        try {
                            if (window.cordova) {
                                if (localStorage.getItem("isAdmin") == "true") {
                                    FCMPlugin.unsubscribeFromTopic(localStorage.getItem("schoolId") + "schoolId");
                                    FCMPlugin.subscribeToTopic(localStorage.getItem("schoolId") + "schoolId");
                                }
                                else {
                                    FCMPlugin.unsubscribeFromTopic(localStorage.getItem("studentId"));
                                    FCMPlugin.subscribeToTopic(localStorage.getItem("studentId"));
                                }
                            }
                        }
                        catch (ex) {

                        }
                        /*subscribe for notifications end*/

                    }).error(function (data) {

                    });
                    /*calling dashboard services end*/
                    angular.element(document.getElementsByClassName("toolImage")).attr("src", localStorage.getItem("schoolLogo"));
                }).error(function (data) { });
            }
            else alert("invalid user name or password");
        }).error(function (data) { });
    }
    /*login event end*/

    /*load calender events start*/
    $scope.loadCalenderEvents = function () {
        $http({
            method: 'POST',
            url: services.GetCalenderEventsService,
            data: { SchoolId: localStorage.getItem("schoolId"), UserId: localStorage.getItem("userId") },
        })
        .success(function (data) {
            calenderEventsList = data.d;
            addColorsToDate();
            $scope.eventsLists = data.d;
            updateCalenderScope(new Date(), false);
            if (localStorage.getItem("isAdmin") != "true")
                angular.element(document.getElementById("btnAddCalender")).css("display", "none");

            if (localStorage.getItem("isAdmin") == "true")
                $("#btnCalenderAdd").show();
            else
                $("#btnCalenderAdd").hide();
        })
        .error(function (data) {

        });
    };
    /*load calender events end*/

    /*load sutudents for calender start*/
    $scope.getStudent = function (loadType) {
        $http({
            method: 'POST',
            url: services.GetStudent,
            data: { SchoolId: localStorage.getItem("schoolId") },
        })
        .success(function (data) {
            var students_List = data.d.StudentsMobileNosListData;
            if (loadType == "calender") {
                var clsList = [], studentsList = [];
                angular.forEach(students_List, function (v, i) {
                    if (clsList.indexOf(v.ClassName) == -1) {
                        clsList.push(v.ClassName);
                    }
                });
                angular.forEach(clsList, function (c, ci) {
                    var obj = {};
                    obj["ClassName"] = c;
                    obj["ClassName_Style"] = replaceSpecialCharacters(c);
                    var data = [];
                    angular.forEach(students_List, function (v, i) {
                        if (c == v.ClassName) {
                            var d = {};
                            d["StudentName"] = v.StudentName;
                            d["StudentID"] = v.StudentID;
                            d["MobNo"] = v.MobNo;
                            $scope.msgCount = v.MsgCount;
                            msgCount = v.MsgCount;
                            data.push(d);
                        }
                    });
                    obj["data"] = data;
                    studentsList.push(obj);
                });
                studentDetails = studentsList;
                $scope.groups = studentDetails;
            }
            else if (loadType == "sms") {
                document.getElementById("showMsgIcon").innerHTML = students_List[0].MsgCount;
            }
        })
        .error(function (data) {

        });
    };
    /*load sutudents for calender end*/

    /*reset calender details start*/
    $scope.resetEvent = function () {
        angular.element(document.getElementById("calenderTitle")).val("");
        angular.element(document.getElementById("calenderLocation")).val("");
        angular.element(document.getElementById("allday")).prop("checked", false);
        angular.element(document.getElementById("calenderStartDate")).val("");
        angular.element(document.getElementById("calenderEndDate")).val("");
        angular.element(document.getElementById("calenderStartTime")).val("");
        angular.element(document.getElementById("calenderEndTime")).val("");
        angular.element(document.getElementsByClassName("timeElements")).css("display", "block");
        angular.element(document.getElementsByClassName("students")).prop("checked", false);
        angular.element(document.getElementsByClassName("h-check")).prop("checked", false);
    }
    /*reset calender details end*/

    /*hide and show allday start*/
    $scope.allDaysToggle = function ($event) {
        if (angular.element($event.currentTarget.querySelectorAll("input")).prop("checked"))
            angular.element(document.getElementsByClassName("timeElements")).css("display", "none");
        else
            angular.element(document.getElementsByClassName("timeElements")).css("display", "block");
    }
    /*hide and show allday end*/

    /*add calender event start*/
    $scope.addEvent = function () {
        var studentIds = "";
        var title = angular.element(document.getElementById("calenderTitle")).val().trim();
        var location = angular.element(document.getElementById("calenderLocation")).val().trim();
        var isAllDay = angular.element(document.getElementById("allday")).prop("checked") == true ? 1 : 0;
        var startDate = angular.element(document.getElementById("calenderStartDate")).val().trim();
        var endDate = angular.element(document.getElementById("calenderEndDate")).val().trim();
        var startTime = angular.element(document.getElementById("calenderStartTime")).val().trim();
        var endTime = angular.element(document.getElementById("calenderEndTime")).val().trim();

        if (title == "") {
            alert("title should not be empty");
            return false;
        }
        if (location == "") {
            alert("location should not be empty");
            return false;
        }
        if (startDate == "") {
            alert("start date should not be empty");
            return false;
        }
        if (endDate == "") {
            alert("end date should not be empty");
            return false;
        }


        angular.forEach(document.getElementsByClassName("students"), function (v, i) {
            if (v.checked)
                studentIds += v.id + " ,";
        });
        if (studentIds == "") {
            alert("student selection should be mandatory");
            return false;
        }
        else
            studentIds = studentIds.substr(0, studentIds.length - 1);

        if (isAllDay == 0) {
            if (startTime == "") {
                alert("start time should not be empty");
                return false;
            }
            if (endTime == "") {
                alert("end time should not be empty");
                return false;
            }
        }
        else {
            startDate = new Date(startDate).getDate() + " " + monthsList[new Date(startDate).getMonth()] + " " + new Date(startDate).getFullYear();
            endDate = new Date(endDate).getDate() + " " + monthsList[new Date(endDate).getMonth()] + " " + new Date(endDate).getFullYear();
        }

        $http({
            method: 'POST',
            url: services.AddCalenderEvents,
            data: {
                SchoolId: localStorage.getItem("schoolId"),
                studentids: studentIds,
                Title: title,
                Location: location,
                Repeat: localStorage.getItem("schoolId"),
                TravelTime: "",
                RepeatDate: "",
                FromDate: startDate,
                ToDate: endDate,
                Time: new Date().getTime(),
                Color: "gray",
                IsAllDay: isAllDay,
                FromTime: startTime,
                ToTime: endTime
            }
        })
           .success(function (data) {
               if (data.d > 0) {
                   $scope.loadCalenderEvents();
                   alert("event has been added successfully");

                   angular.element(document.getElementsByClassName("h-check")).prop("checked", false);
                   angular.element(document.getElementsByClassName("students")).prop("checked", false);
                   angular.element(document.getElementById("calenderTitle")).val("");
                   angular.element(document.getElementById("calenderLocation")).val("");
                   angular.element(document.getElementById("calenderStartDate")).val("");
                   angular.element(document.getElementById("calenderEndDate")).val("");
                   angular.element(document.getElementById("calenderStartTime")).val("");
                   angular.element(document.getElementById("calenderEndTime")).val("");

                   $timeout(function () {
                       angular.element(document.querySelectorAll(".button.button-clear.button-primary.mm-btn")).triggerHandler('click');
                   }, 100);
               }
           })
           .error(function (data) {

           })
    }
    /*add calender event end*/

    $scope.addAlbum = function () {
        $scope.showaddAlbum = !$scope.showaddAlbum;
    };

    $scope.CloseGalleryMasterSave = function () {
        $scope.showaddAlbum = !$scope.showaddAlbum;
        $('#txtAlbumName').val("");
        $('#txtDescription').val("");
        $('#txtLocation').val("");
    };

    /*get student wise calendar/attendance details start*/
    if (localStorage.getItem("isAdmin") != "true") {
        $scope.getStudentCalendarDetails = function (monthId, yearId) {
            if (monthId == 0)
                monthId = new Date().getMonth() + 1;
            if (yearId == 0)
                yearId = new Date().getFullYear();

            $http({
                method: 'POST',
                url: services.GetStudentCalendar,
                data: { schoolId: localStorage.getItem("schoolId"), studentId: localStorage.getItem("studentId"), classId: 0, month: monthId, year: yearId },
            })
            .success(function (data) {
                angular.element(document.querySelectorAll("#student_name")).text(data.d.StudentName);
                angular.element(document.querySelectorAll("#class_name")).text(data.d.ClassName);
                var attendance_Dtls = data.d.Attendance;
                var attendanceLent = attendance_Dtls.split("|");
                var todayDay = new Date().getDate();
                var attendance_fList = [], final_att_List = [];
                if (attendanceLent.length > 0) {
                    if (attendanceLent.length > 1) {
                        attendance_fList = attendanceLent[1].split("_")
                    }
                    else {
                        attendance_fList = attendanceLent[0].split("_")
                    }


                    var holidaysCount = [];
                    angular.forEach(data.d.HolidayDates_List, function (_c, _d) {
                        for (var j = _c.StartDay; j <= _c.EndDay; j++) {
                            if (holidaysCount.indexOf(j) == -1) {
                                holidaysCount.push(j);
                            }
                        }
                    });
                    holidaysCount = holidaysCount.sort();
                    angular.forEach(attendance_fList, function (_a, _b) {
                        if (holidaysCount.indexOf(_b + 1) > -1) {
                            final_att_List.push("9");//9 means holiday
                        }
                        final_att_List.push(_a.toString());
                    });

                    angular.forEach(data.d.SundayDetails_List, function (_a, _b) {
                        angular.element(document.querySelectorAll(".pickadate-enabled")[(_a.Day - 1)]).addClass("sunday-color");
                    });

                    angular.forEach(final_att_List, function (_a, _b) {
                        if (_b < (todayDay - 1)) {
                            if (!angular.element(document.querySelectorAll(".pickadate-enabled")[(_b)]).hasClass("sunday-color")) {
                                if (_a == "0") {
                                    angular.element(document.querySelectorAll(".pickadate-enabled")[_b]).addClass("student-absent");
                                }
                                if (_a == "9") {
                                    angular.element(document.querySelectorAll(".pickadate-enabled")[_b]).addClass("student-holiday");
                                }
                            }
                        }
                    });
                }
            })
            .error(function (data) {
            });
        }

    }
    /*get student wise calendar details end*/

    /*details for attendance for admin start*/
    if (localStorage.getItem("isAdmin") == "true") {
        $scope.showNoStudents = true;
        $scope.getStudentCalendarDetails = function () {
            $http({
                method: 'POST',
                url: services.ClassNamesForAttendance,
                data: { schoolId: localStorage.getItem("schoolId") }
            })
            .success(function (data) {
                $scope.attendanceClass = data.d.AttendenceClass;
                angular.element(document.getElementById("set_date_for_attendance")).val(returnToday());
                angular.element(document.getElementById("set_date_for_attendance")).attr("min", new Date().getFullYear() + "-01-01");
            })
            .error(function (data) {
            })
        }

    }
    $scope.selected = "";
    $scope.loadStudentForAttedance = function () {
        if (angular.element(document.querySelector("#options_cls")).val() == "?")
            return false;

        var classId = angular.element(document.querySelector("#options_cls")).val().split(":")[1]
        var selectedDate = new Date(angular.element(document.querySelector("#set_date_for_attendance")).val());
        $http({
            method: 'POST',
            url: services.StudentsForAttendance,
            data: {
                schoolId: localStorage.getItem("schoolId"),
                classId: parseInt(classId),
                year: selectedDate.getFullYear(),
                month: selectedDate.getMonth() + 1
            }
        })
        .success(function (data) {
            $scope.WeekendsData = data.d.WeekendsData  //<Day>6</Day><DayName>Sunday</DayName>
            $scope.GetHolidaysList_Data = data.d.GetHolidaysList_Data  //<HolidayName><StartDay></EndDay>
            getStudentsAttendenceData = data.d.GetStudentsAttendenceListData;
            getAttendenceDurationList = data.d.GetAttendenceDurationList
            if (!$scope.CheckHoliday($scope, selectedDate.getDate())) {
                attendanceStudent = data.d.GetStudentsDetailsForAttendece;
                for (i = 0; i < attendanceStudent.length; i++) {
                    index = getStudentsAttendenceData.findIndex(function (e) { return e.StudentId == attendanceStudent[i].StudentId })
                    if (index > -1 && getStudentsAttendenceData[index].Attendence.indexOf("yes") == -1) {
                        if (getStudentsAttendenceData[index].Attendence.split("|").length > 1)
                            attendance = getStudentsAttendenceData[index].Attendence.split("|")[1].split("_");
                        else
                            attendance = getStudentsAttendenceData[index].Attendence.split("|")[0].split("_")
                    }
                    else
                        attendance = ("0_").repeat(data.d.DaysInMonth).substr(0, ("0_").repeat(data.d.DaysInMonth).length - 1).split("_");

                    attendanceStudent[i].checked = "";
                    if (attendance[selectedDate.getDate() - 1] == 1)
                        attendanceStudent[i].checked = "checked";
                }
                getStudentsAttendenceData.DaysInMonth = data.d.DaysInMonth;

                $scope.attendanceStudent = attendanceStudent;
                $scope.classWiseStudentList = [];
                $scope.checkedInStudent = [];
                $scope.checkedOutStudent = [];
                for (i = 0; i < attendanceStudent.length; i++) {
                    currentDate = selectedDate.getDate();
                    studentId = attendanceStudent[i].StudentId;
                    index = getAttendenceDurationList.findIndex(function (e) { return e.StudentId == studentId && e.DayId == currentDate })
                    if (index == -1)
                        $scope.classWiseStudentList.push(attendanceStudent[i]);
                    else {
                        Duration = getAttendenceDurationList[index].Duration;
                        if (Duration != "" && Duration != null)
                            $scope.checkedOutStudent.push(attendanceStudent[i]);
                        else if (Duration == null || Duration == "")
                            $scope.checkedInStudent.push(attendanceStudent[i]);
                    }
                }

                if ($scope.attendanceStudent.length == 0) {
                    $scope.showNoStudents = true;
                    $scope.saveNoStudents = false;
                }
                else {
                    $scope.showNoStudents = false;
                    $scope.saveNoStudents = true;
                }
                angular.element(document.querySelectorAll(".check_all_stu")).prop("checked", false);
                setTimeout(function () {
                    $(".toggle input.checked").prop("checked", true);
                    if ($(".toggle input.checked").length == attendanceStudent.length)
                        angular.element(document.querySelectorAll(".check_all_stu")).prop("checked", true);
                })
                $scope.holidayMsg = false;
            }
            else {
                $scope.attendanceStudent = [];
                $scope.showNoStudents = false;
                $scope.holidayMsg = true;
                $scope.saveNoStudents = false;
            }
            $scope.openQRScanner();
        })
        .error(function (data) {
        })
    }

    $scope.openQRScanner = function () {
        if (window.cordova) {
            cordova.plugins.barcodeScanner.scan(
              function (result) {
                  if (result.cancelled == false) {
                      alert("QR Scanner Result\n" +
                            "Result: " + result.text + "\n" +
                            "Format: " + result.format + "\n" +
                            "Cancelled: " + result.cancelled);
                      var selectedDate = new Date(angular.element(document.querySelector("#set_date_for_attendance")).val());
                      var holidayFlag = $scope.CheckHoliday($scope, selectedDate.getDate());
                      studentId = result.text.split(" ")[1];
                      classId = result.text.split(" ")[1];
                      if ($("#tab-1").hasClass("active-tab-content")) {
                          attendanceStudent = $scope.attendanceStudent;
                          index = attendanceStudent.findIndex(function (e) { return e.StudentId == studentId })
                          attendanceStudent[index].checked = "checked";
                          $scope.attendanceStudent = attendanceStudent;
                          index = getStudentsAttendenceData.findIndex(function (e) { return e.StudentId == studentId });
                          if (index == -1 || getStudentsAttendenceData[index].Attendence.indexOf("yes") > -1)
                              attendance = ("0_").repeat(getStudentsAttendenceData.DaysInMonth).substr(0, ("0_").repeat(31).length - 1);
                          else {
                              if (getStudentsAttendenceData[index].Attendence.split("|").length > 1)
                                  attendance = getStudentsAttendenceData[index].Attendence.split("|")[1];
                              else
                                  attendance = getStudentsAttendenceData[index].Attendence.split("|")[0];
                          }
                          attendance = attendance.split("_");
                          if (holidayFlag) {
                              attendance[selectedDate.getDate() - 1] = "0";
                          }
                          else {
                              attendance[selectedDate.getDate() - 1] = "1";
                          }
                          attendance = attendance.join().replace(/,/g, "_");
                          $http({
                              method: 'POST',
                              url: services.AddAttendance,
                              data: {
                                  schoolId: localStorage.getItem("schoolId"),
                                  classId: parseInt(classId),
                                  studentId: studentId,
                                  yearId: selectedDate.getFullYear(),
                                  monthId: selectedDate.getMonth() + 1,
                                  attendance: attendance
                              }
                          })
                          .success(function (data) {
                              console.log(data)
                          })
                          .error(function (data) {
                              console.log(data)
                          })
                      }
                      else {
                          $scope.selectStudentForCheckIn(studentId, $event, view);
                          $scope.markStudentAsAbsent(".all");
                      }
                  }
                  else {
                      alert("QR Scanner cancelled")
                  }
              },
              function (error) {
                  alert("Scanning failed");
              },
              {
                  preferFrontCamera: false, // iOS and Android
                  showFlipCameraButton: true, // iOS and Android
                  showTorchButton: true, // iOS and Android
                  torchOn: false, // Android, launch with the torch switched on (if available)
                  saveHistory: true, // Android, save scan history (default false)
                  prompt: "Place a QRScancode inside the scan area", // Android
                  resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                  formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                  orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                  disableAnimations: true, // iOS
                  disableSuccessBeep: false // iOS and Android
              }
           );
        }
    }

    $scope.myValue = "";
    $scope.check_all_students = function ($event) {
        if (angular.element($event.currentTarget).prop("checked")) {
            angular.element(document.querySelectorAll(".students_class")).prop("checked", true);
        }
        else
            angular.element(document.querySelectorAll(".students_class")).prop("checked", false);
    }
    $scope.getAttendanceDateWise = function () {
        $scope.loadStudentForAttedance();
    }

    $scope.saveAttendance = function (view) {
        var classId = angular.element(document.querySelector("#options_cls")).val().split(":")[1]
        var selectedDate = new Date(angular.element(document.querySelector("#set_date_for_attendance")).val());
        var holidayFlag = $scope.CheckHoliday($scope, selectedDate.getDate());
        angular.forEach(angular.element(document.querySelectorAll(".students_class")), function (_a, _b) {
            index = getStudentsAttendenceData.findIndex(function (e) { return e.StudentId == parseInt(_a.id.split("_")[1]) })
            if (index == -1 || getStudentsAttendenceData[index].Attendence.indexOf("yes") > -1)
                attendance = ("0_").repeat(getStudentsAttendenceData.DaysInMonth).substr(0, ("0_").repeat(31).length - 1);
            else {
                if (getStudentsAttendenceData[index].Attendence.split("|").length > 1)
                    attendance = getStudentsAttendenceData[index].Attendence.split("|")[1];
                else
                    attendance = getStudentsAttendenceData[index].Attendence.split("|")[0];
            }
            attendance = attendance.split("_");
            if (holidayFlag) {
                attendance[selectedDate.getDate() - 1] = "0";
            }
            else {
                if (view == 'daywise') {
                    if ($(_a).prop("checked") == true)
                        attendance[selectedDate.getDate() - 1] = "1";
                    else
                        attendance[selectedDate.getDate() - 1] = "0";
                }
                else if (view == 'all') {
                }
            }
            attendance = attendance.join().replace(/,/g, "_");
            $http({
                method: 'POST',
                url: services.AddAttendance,
                data: {
                    schoolId: localStorage.getItem("schoolId"),
                    classId: parseInt(classId),
                    studentId: parseInt(_a.id.split("_")[1]),
                    yearId: selectedDate.getFullYear(),
                    monthId: selectedDate.getMonth() + 1,
                    attendance: attendance
                }
            })
                .success(function (data) {
                    if (_b == angular.element(document.querySelectorAll(".students_class")).length - 1)
                        alert("Attendance saved successfully!");
                })
                .error(function (data) {
                    alert("Error please try again !");
                })
        });
    }

    $scope.CheckHoliday = function ($scope, todayDay) {
        var _isHoliday = false;
        angular.forEach($scope.WeekendsData, function (_a, _b) {
            if (_a.Day == todayDay) {
                _isHoliday = true;
            }
        });

        if (_isHoliday == false) {
            angular.forEach($scope.GetHolidaysList_Data, function (_a, _b) {
                if (_a.StartDay >= todayDay && _a.EndDay <= todayDay) {
                    _isHoliday = true;
                }
            });
        }
        return _isHoliday;
    }


    $ionicModal.fromTemplateUrl('templates/classwiseAttendance.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.loadclassWiseStudents = modal;
    });

    $scope.selectStudentForCheckIn = function (studentId, $event, view) {
        if ($event != undefined)
            view = $($event.currentTarget).parents(".tab-content").attr("id");
        if (!$("#" + view + " .imageCircle[studentId='" + studentId + "'] .cornerCircle").hasClass("checkedIn")) {
            $("#" + view + " .imageCircle[studentId='" + studentId + "'] .cornerCircle").addClass("checkedIn")
            if (view == "tab-3")
                $("#" + view + " .imageCircle[studentId='" + studentId + "'] .cornerCircle").addClass("checkedIn").addClass("addCheckOut");
            $("#" + view + " .bottomButtonSelected").css("display", "block");
            $("#" + view + " .bottomButton.scan").css("display", "none");
        }
        else {
            $("#" + view + " .imageCircle[studentId='" + studentId + "'] .cornerCircle").removeClass("checkedIn");
            if (view == "tab-3")
                $("#" + view + " .imageCircle[studentId='" + studentId + "'] .cornerCircle").removeClass("checkedIn").removeClass("addCheckOut");
            if (!$("#" + view + " .imageCircle .cornerCircle").hasClass("checkedIn")) {
                $("#" + view + " .bottomButtonSelected").css("display", "none");
                $("#" + view + " .bottomButton.scan").css("display", "block");
            }
        }
    }

    $scope.markStudentAsAbsent = function () {
        $(".all .cornerCircle.checkedIn").addClass("checkedOut").removeClass("checkedIn");
        $(".all .cornerCircle.checkedOut").parents(".imageCircle").css("pointer-events", "none")
        element = $(".all .cornerCircle.checkedOut").parents(".outerSquare");
        $(".checkOut.tab-content .itemLists").append(element);
    }

    $scope.markStudentAsCheckedIn = function (view) {
        //$(".cornerCircle.checkedIn").parents(".outerSquare").html(customHtml($compile)($scope));
        //$(".cornerCircle.checkedIn").parents(".imageCircle").attr("ng-click","markStudentAsCheckedOut()");
        if (view == "all") {
            element = $(".cornerCircle.checkedIn").parents(".outerSquare");
            $(".all .cornerCircle.checkedIn").addClass("checkedOut").removeClass("checkedIn");
            $(".checkIn.tab-content").prepend(element);
            $(".checkIn.tab-content .cornerCircle").addClass("checkedOut").removeClass("checkedIn");

        }
        else if (view == "checkIn") {
            $("." + view + " .cornerCircle.checkedOut.addCheckOut").removeClass("checkedIn");
            $("." + view + " .cornerCircle.checkedOut.addCheckOut").parents(".imageCircle").css("pointer-events", "none")
            element = $("." + view + " .cornerCircle.checkedOut.addCheckOut").parents(".outerSquare");
            $(".checkOut.tab-content .itemLists").append(element);
        }
    }
    $scope.markStudentAsCheckedOut = function () {
        element = $(".cornerCircle.checkedOut").parents(".outerSquare");
        $(".cornerCircle.checkedOut").parents(".imageCircle").css("pointer-events", "none")
        $(".checkOut.tab-content .itemLists").append(element);
    }
    /*details for attendance for admin end*/

    $scope.gotoGallery = function (galleryId) {
        $scope.getFolderImages(galleryId);
        $state.go('app.gallery');
        localStorage.setItem("GalleryId", galleryId);
        localStorage.setItem("GalleryName", $('#hdnimageview' + galleryId).val());
        setTimeout(function () {
            if (localStorage.getItem("isAdmin") != "true")
                $("#galleryThumbnails .file-button.col").parent().parent().css("display", "none");
        })
    }
    $scope.backtoAlbum = function () {
        $state.go('app.gallerylist');
        setTimeout(function () {
            if (localStorage.getItem("isAdmin") == "true")
                $("#photoAlbumThumbnails .add-album-row").css("display", "block");

            hideMenuClick();
        })
    }

    /*get gallery folders list start */
    $scope.getGalleryFolder = function () {
        $(".loader").css({ "display": "block" });
        $http({
            method: 'POST',
            url: services.GetGalleryFolders,
            data: { schoolId: localStorage.getItem("schoolId") },
        })
        .success(function (data) {
            $scope.galleryFoldersList = data.d;
            setTimeout(function () {
                if (localStorage.getItem("isAdmin") == "true")
                    $("#photoAlbumThumbnails .add-album-row").css("display", "block");
            })
            $(".loader").css({ "display": "none" });
        })
        .error(function (data) {
            $(".loader").css({ "display": "none" });
        });
    }
    /*get gallery folders list end */

    /*get gallery images start*/
    $scope.getFolderImages = function (galleryId) {
        $(".loader").css({ "display": "block" });
        $scope.items = [];
        $http({
            method: 'POST',
            url: services.GetAlbumIamges,
            data: {
                SchoolId: localStorage.getItem("schoolId"),
                GalleryID: galleryId,
                UserID: localStorage.getItem("userId")
            },
        })
        .success(function (data) {
            hideMenuClick();
            angular.forEach(data.d.IamgesListDetails, function (i, v) {
                var obj = {};
                obj["src"] = "https://www.littleconnect.in/" + i.ImageSrc;
                obj["sub"] = "";// i.IamgeName;
                obj["thumb"] = "https://www.littleconnect.in/" + i.ImageSrc;
                $scope.items.push(obj);
            });
            $(".loader").css({ "display": "none" });
        })
        .error(function (data) {
            $(".loader").css({ "display": "none" });
        });
    }
    /*get gallery images end*/

    /*add gallery start*/
    $scope.AddGalleryMasterSave = function () {
        if ($("#txtAlbumName").val() == "") {
            alert('Please enter the AlbumName');
        }
        else if ($("#txtDescription").val() == "") {
            alert('Please enter the Description');
        }
        else if ($("#txtLocation").val() == "") {
            alert('Please enter the Location');
        }
        else {
            $(".loader").css({ "display": "block" });
            $http({
                method: 'POST',
                url: services.AddAlbumToGallery,
                data: {
                    schoolId: localStorage.getItem("schoolId"),
                    AlbumName: $('#txtAlbumName').val().trim(),
                    Description: $('#txtDescription').val().trim(),
                    Location: $('#txtLocation').val().trim()
                }
            })
                .success(function (response) {
                    switch (response.d.IsValid) {
                        case true:
                            alert("Album has been created successfully");
                            $scope.getGalleryFolder()
                            $scope.showaddAlbum = !$scope.showaddAlbum;
                            $('#txtAlbumName').val("");
                            $('#txtDescription').val("");
                            $('#txtLocation').val("");
                            break;
                        default:
                            alert("oops something went wrong please contact support team");
                            break;
                    }
                    $(".loader").css({ "display": "none" });
                })
                .error(function (response) {
                    alert("oops something went wrong please contact support team");
                    $(".loader").css({ "display": "none" });
                })
        }
    }
    /*add gallery end*/

    // SMS add recipients
    $ionicModal.fromTemplateUrl('templates/addrecipients.html', {
        scope: $scope
    }).then(function (modal) {
        try {
            document.getElementById("showMsgIcon").innerHTML = '<i class="ion-ios-speedometer-outline"></i>';
        }
        catch (ex) { }
        $scope.modal = modal;
    });
    // inviatees group

    $scope.toggleGroup = function (group) {
        if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = group;
        }
    };
    $scope.isGroupShown = function (group) {
        return $scope.shownGroup === group;
    };

    $scope.selectAllChild = function ($event) {
        if ($event.currentTarget.checked) {
            angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".students")).prop("checked", true);
        }
        else
            angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".students")).prop("checked", false);
    };
    $scope.student_Click = function (classN, $event) {
        var checkedSelectionLength = angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".sms_" + classN + ":checked")).length;
        var totalSelectionLength = angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".sms_" + classN)).length;
        if (checkedSelectionLength == totalSelectionLength)
            angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".parent_" + classN)).prop("checked", true);
        else
            angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".parent_" + classN)).prop("checked", false);
    };

    /*add student details start*/
    $scope.addSmsReceipt = function ($event) {
        var student_Selection = "";
        var studentsSelections = "";
        var clasList = [];
        receiptList = [];
        angular.forEach(angular.element(document.querySelectorAll(".parentsCheck:checked")), function (data, value) {
            studentsSelections += angular.element(data).attr("title") + ',';
            var cl = angular.element(data).attr("title");
            clasList.push(angular.element(data).attr("title"))

            angular.forEach(angular.element(document.querySelectorAll(".sms_" + addDotWithClass(replaceSpecialCharacters(cl)) + ":checked")), function (data_S, value_S) {
                var obj = {};
                obj.StudentId = angular.element(data_S).attr("id");
                obj.MobNo = angular.element(data_S).attr("ng-mob");
                receiptList.push(obj);
            });
        });

        angular.forEach(angular.element(document.querySelectorAll(".parentsCheck")), function (data, value) {
            var cl = angular.element(data).attr("title");
            if (clasList.indexOf(cl) == -1) {
                angular.forEach(angular.element(document.querySelectorAll(".sms_" + addDotWithClass(replaceSpecialCharacters(cl)) + ":checked")), function (data_S, value_S) {
                    studentsSelections += angular.element(data_S).attr("title") + ',';
                    var obj = {};
                    obj.StudentId = angular.element(data_S).attr("id");
                    obj.MobNo = angular.element(data_S).attr("ng-mob");
                    receiptList.push(obj);
                });
            }
        });
        if (studentsSelections != "") {
            studentsSelections = studentsSelections.substr(0, studentsSelections.length - 1);
            angular.element(document.getElementById("smsContacts")).val(studentsSelections);
        }
        else {
            alert("students selections are mandatory");
            $event.stopPropagation();
        }
    }
    /*add student details end*/

    /*send sms start*/
    $scope.sendSms = function () {
        if (angular.element(document.getElementById("txtMessageText")).val().trim() == "") {
            alert("message text should not be empty");
            return false;
        }
        $(".loader").css({ "display": "block" });
        $http({
            method: 'POST',
            url: services.SMSCount,
            data: { schoolId: localStorage.getItem("schoolId") },
        })
          .success(function (data) {
              if (data.d >= receiptList.length) {
                  var smsIndex = 0;
                  angular.forEach(receiptList, function (value, index) {
                      $http({
                          method: 'POST',
                          url: services.SendSMS,
                          data: {
                              studentId: value.StudentId, schoolId: localStorage.getItem("schoolId"), mobileNo: value.MobNo,
                              messageText: angular.element(document.getElementById("txtMessageText")).val(),
                              time: new Date().getTime(), schoolName: ''
                          },
                      })
                        .success(function (data) {
                            smsIndex++;
                            if (receiptList.length == smsIndex) {
                                alert("Your messages will be sent shortly subject to Current Status of your account.");
                                receiptList = [];
                                angular.element(document.getElementById("smsContacts")).val("");
                                angular.element(document.getElementById("txtMessageText")).val("");
                                angular.element(document.getElementsByClassName("students")).prop("checked", false);
                                angular.element(document.getElementsByClassName("parentsCheck")).prop("checked", false);
                                $scope.getStudent("sms");
                                $(".loader").css({ "display": "none" });
                            }
                        })
                        .error(function (response) {
                            $(".loader").css({ "display": "none" });
                        })
                  });
              }
              else {
                  alert("Please recharge your account");
                  $(".loader").css({ "display": "none" });
              }
          })
          .error(function (data) {
              $(".loader").css({ "display": "none" });
          })
    }
    /*send sms end*/

    /*show msg icon functionality start*/
    $scope.showMsgCount = function () {
        document.getElementById("showMsgIcon").innerHTML = msgCount;
    }
    /*show msg icon functionality end*/

    /*add sms template start*/
    $ionicModal.fromTemplateUrl('templates/smsTemplate.html', {
        scope: $scope
    }).then(function (modal) {
        try {
            $http({
                method: 'POST',
                url: services.GetSMSTemplateForApp,
                data: { schoolId: localStorage.getItem("schoolId"), templateId: 0, type: 1 },
            })
       .success(function (data) {
           $scope.templates = data.d.TemplatesList_Data;
           //[{"id":"1","message":"Can't talk now, call you back later?"},{"id":"2","message":"In a meeting"},{"id":"3","message":"Success"}]
       })
       .error(function (data) {
           console.log("error");
       })
        }
        catch (ex) { }
        $scope.addSmsTemplate = modal;
    });
    /*add sms template end*/

    /*inserting template to message box start*/
    $scope.addTemplateItem = function (template) {
        message = template.Description;
        $(".sms .messageBox").val(message);
        $scope.addSmsTemplate.hide();
    }
    /*inserting template to message box end*/

    /*delete template start*/
    $scope.deleteTemplateItem = function (templateId) {
        var flag = confirm("Are you sure you want to delete the template?");
        if (flag) {
            $http({
                method: 'POST',
                url: services.DeleteSMSTemplateForApp,
                data: { templateId: templateId },
            })
           .success(function (data) {
               alert("Template has been deleted successfully");
               $(".sms-templates").find(".item-stable.item[ng-templateid='" + templateId + "']").remove();
           })
           .error(function (data) {
               console.log("error");
           })
        }
    }
    /*delete template end*/

    /*edit template start*/
    $scope.editTemplateItem = function () {
        if ($("#TemplateDescription").val() == "") {
            alert("Please enter template name!");
            return false;
        }
        if ($("#TemplateDescription").val() == "") {
            alert("Please enter template description!");
            return false;
        }
        var flag = confirm("Are you sure you want to edit the template?");
        if (flag) {
            $http({
                method: 'POST',
                url: services.EditSMSTemplateForApp,
                data: { schoolId: localStorage.getItem("schoolId"), templateName: $("#TemplateName").val(), description: $("#TemplateDescription").val(), templateId: editTemplateId },
            })
           .success(function (data) {
               $(".smsTemplate").remove();
               $(".modal-backdrop").removeClass("active");
               $ionicModal.fromTemplateUrl('templates/smsTemplate.html', {
                   scope: $scope
               }).then(function (modal) {
                   try {
                       $http({
                           method: 'POST',
                           url: services.GetSMSTemplateForApp,
                           data: { schoolId: localStorage.getItem("schoolId"), templateId: 0, type: 1 },
                       })
                      .success(function (data) {
                          $scope.templates = data.d.TemplatesList_Data;
                      })
                      .error(function (data) {
                          console.log("error");
                      })
                   }
                   catch (ex) { }
                   $scope.addSmsTemplate = modal;
                   $scope.addSmsTemplate.show();
               });
               alert("Template has been edited successfully");
               $(".smsTemplate .addtemplate").hide();
               $("#TemplateDescription").val("");
               $("#TemplateName").val("");
           })
           .error(function (data) {
               console.log("error");
           })
        }
    }
    /*edit template end*/
    //$scope.showaddTemplate=false;
    $scope.addCustomTemplate = function () {
        showaddTemplate = !showaddTemplate;
        if (showaddTemplate)
            $(".smsTemplate .addtemplate").show();
        else
            $(".smsTemplate .addtemplate").hide();
        $("#btnEdit").hide();
        $("#btnSave").show();
        $("#btnClose").show();
    };
    $scope.editTemplate = function (templateId) {
        showaddTemplate = !showaddTemplate;
        if (showaddTemplate)
            $(".smsTemplate .addtemplate").show();
        else
            $(".smsTemplate .addtemplate").hide();
        $("#btnSave").hide();
        $("#btnClose").show();
        $("#btnEdit").show();
        editTemplateId = templateId;
    };
    $scope.CloseTemplateSave = function () {
        showaddTemplate = false;
        $(".smsTemplate .addtemplate").hide();
        $("#TemplateDescription").val("");
        $("#TemplateName").val("");
    }
    $scope.AddTemplateSave = function () {
        if ($("#TemplateDescription").val() == "") {
            alert("Please enter template name!");
            return false;
        }
        if ($("#TemplateDescription").val() == "") {
            alert("Please enter template description!");
            return false;
        }
        $http({
            method: 'POST',
            url: services.ADDSMSTemplateForApp,
            data: { schoolId: localStorage.getItem("schoolId"), templateName: $("#TemplateName").val(), description: $("#TemplateDescription").val() },
        })
            .success(function (data) {
                $(".smsTemplate").remove();
                $(".modal-backdrop").removeClass("active");
                $ionicModal.fromTemplateUrl('templates/smsTemplate.html', {
                    scope: $scope
                }).then(function (modal) {
                    try {
                        $http({
                            method: 'POST',
                            url: services.GetSMSTemplateForApp,
                            data: { schoolId: localStorage.getItem("schoolId"), templateId: 0, type: 1 },
                        })
                       .success(function (data) {
                           $scope.templates = data.d.TemplatesList_Data;
                       })
                       .error(function (data) {
                           console.log("error");
                       })
                    }
                    catch (ex) { }
                    $scope.addSmsTemplate = modal;
                    $scope.addSmsTemplate.show();
                });
                alert("Template has been added successfully");
                $(".smsTemplate .addtemplate").hide();
                $("#TemplateDescription").val("");
                $("#TemplateName").val("");
            })
            .error(function (data) {
                console.log("error");
            })

    }
    /*bind initial load for enquiry start*/
    $scope.loadStudentEnquiry = function () {
        $http({
            method: 'POST',
            url: services.LoadInitialStudentEnquiry,
            data: { schoolId: localStorage.getItem("schoolId") },
        })
        .success(function (data) {
            $("#txtClass,#ddlAssigned").empty();
            $("#txtClass").append($("<option></option>").val(0).html('--Select--'));
            angular.forEach(data.d.ClassEnquiryList_Data, function (_a, _b) {
                $("#txtClass").append("<option value=" + _a.ClassId + ">" + _a.ClassName + "</option>");
            });

            $("#ddlAssigned").append($("<option></option>").val(0).html('--Select--'));
            angular.forEach(data.d.StaffEnquiryList_Data, function (_a, _b) {
                $("#ddlAssigned").append("<option value=" + _a.StaffId + ">" + _a.StaffName + "</option>");
            });

            $("#hasOtp").val(data.d.IsAllowEnquiryOTP)

            $("#txtFathMob1").removeAttr("disabled");
            $("#txtFathMob1").removeAttr("readonly");

            $(".nototp,#enquiryVideoTab,.otpEnq,.enterOTP").hide();

            //enquiry video check
            if (data.d.VideoFilePath == "" || data.d.VideoFilePath == undefined) {
                $("#hasVideo").val("");
                $("#enquiryVideoSrc")[0].src = "";
                $("#enquiryVideoTab").hide();
                $(".otpEnq").show();

                if ($("#hasOtp").val() == "false") {
                    $(".otpEnq").hide();
                    $(".nototp").show();
                }
            }
            else {
                $("#hasVideo").val(data.d.VideoFilePath);
                $("#enquiryVideoSrc")[0].src = data.d.VideoFilePath;
                $("#enqVideo")[0].load();
                $("#enqVideo")[0].play();
                $("#enquiryVideoTab").show();
                $(".otpEnq").hide();
                $(".nototp").hide();
            }
        })
        .error(function (data) {

        });
    }
    /*bind initial load for enquiry end*/

    $scope.showOTPScreen = function () {
        if ($("#hasOtp").val() == "true") {
            $("#enquiryVideoTab").hide();
            $(".otpEnq").show();
        }
        else {
            $("#enquiryVideoTab").hide();
            $(".otpEnq").hide();
            $(".nototp").show();

            $("#txtFathMob1").removeAttr("disabled");
            $("#txtFathMob1").removeAttr("readonly");
        }
    }

    $scope.addEnquiry = function () {
        if ($("#txtFirstName").val() == 0) {
            alert("name selection is mandatory");
            return false;
        }

        if ($("#txtClass").val() == 0) {
            alert("class selection is mandatory");
            return false;
        }

        var request = {};
        request.name = $("#txtFirstName").val();
        request.classId = $("#txtClass").val();
        request.DOB = $("#txtDateOfBirth").val();
        request.fatherName = $("#txtFatherName").val();
        request.fathMob = $("#txtFathMob1").val();
        request.motherName = $("#txtMotherName").val();
        request.mothMob = $("#txtMothMob1").val();
        request.emailId = $("#txtEmail").val();
        request.occuption = $("#txtOccupation").val();
        request.gender = ($("#rardioMale").prop("checked") == true ? 1 : 0);
        request.dueDate = '01 JAN 2018';//$("#txtStartDate").val();
        request.dueTime = "12:00PM";//$("#start-date-time").val();
        request.type = $("#ddlType").val();
        request.assignedTo = 0;//$("#ddlAssigned").val();
        request.remainderDate = '01 JAN 2018';//$("#ddlRemainder").val();
        request.remainderTime = '12:00am'//$("#ddlremainderTime").val();
        request.schoolId = localStorage.getItem("schoolId");
        request.isConverted = false;
        request.note = $("#txtNote").text();

        $http({
            method: 'POST',
            url: services.AddStudentEnquiry,
            data: request,
        })
        .success(function (data) {
            if (data.d.ResponseMessage != "record already preset. duplicates entries not allowed") {
                alert(data.d.ResponseMessage);
                $("#txtFirstName").val("");
                $("#txtClass").val(0);
                $("#txtDateOfBirth").val("");
                $("#txtFatherName").val("");
                $("#txtFathMob1").val("");
                $("#txtMotherName").val("");
                $("#txtMothMob1").val("");
                $("#txtEmail").val("");
                $("#txtOccupation").val("");
                $("#rardioMale").prop("checked", true)
                $("#txtStartDate").val("");
                $("#start-date-time").val("");
                $("#ddlType").val("Email");
                $("#ddlAssigned").val(0);
                $("#ddlRemainder").val("");
                $("#ddlremainderTime").val("");
                $("#txtNote").text("");
                $(".nototp").hide();
                $(".otpEnq").show();
                $("#btnSendOTP").removeAttr("readonly");
                $("#btnVerify").removeAttr("readonly");

                $("#txtOtp,#btnVerify,#btnOTPclear").hide();
                $("#txtForMobNo,#btnSendOTP").show();
                $("#txtOtp").val("");
                $("#txtForMobNo").val("");
                $("#btnSendOTP").removeAttr("readonly");
                $("#btnVerify").removeAttr("readonly");
                $(".generateOTP").show();
                $(".enterOTP").hide();
                if ($("#hasVideo").val() != "") {
                    $("#enquiryVideoTab").show();
                    $(".otpEnq").hide();
                }

                if ($("#hasOtp").val() != "true") {
                    $(".otpEnq").hide();
                    $(".nototp").show();

                    $("#txtFathMob1").removeAttr("disabled");
                    $("#txtFathMob1").removeAttr("readonly");
                    if ($("#hasVideo").val() != "") {
                        $(".nototp").hide();
                    }
                }
            }
            else
                alert(data.d.ResponseMessage);
        })
        .error(function (data) {
            alert("oops something went wrong please contact support");
        });
    }

    $scope.generateOTP = function () {
        if ($("#txtForMobNo").val() == "" || $("#txtForMobNo").val().length != 10) {
            alert("invalid mobile no");
            return false;
        }
        var request = {};
        request.otpLength = 5;
        request.mobileNo = $("#txtForMobNo").val();
        request.schoolId = localStorage.getItem("schoolId");
        $("#btnSendOTP").attr("readonly", "readonly");
        $http({
            method: 'POST',
            url: services.GenerateOTP,
            data: request,
        })
       .success(function (data) {
           $("#txtOtp,#btnVerify,#btnOTPclear").show();
           $("#txtForMobNo,#btnSendOTP").hide();
           $("#txtFathMob1").val($("#txtForMobNo").val());
           $(".generateOTP").hide();
           $(".enterOTP").show();
       })
       .error(function (data) {
           alert("oops something went wrong please contact support");
           $("#btnSendOTP").removeAttr("readonly");
       })
    }

    $scope.verifyOTP = function () {
        if ($("#txtOtp").val() == "" || $("#txtOtp").val().length != 5) {
            alert("invalid OTP");
            return false;
        }
        var request = {};
        request.otp = $("#txtOtp").val();
        request.mobileNo = $("#txtForMobNo").val();
        request.schoolId = localStorage.getItem("schoolId");
        $("#btnVerify").attr("readonly", "readonly");
        $http({
            method: 'POST',
            url: services.CheckOTP,
            data: request,
        })
           .success(function (data) {
               if (data.d == 1) {
                   $("#txtOtp").hide();
                   $("#txtForMobNo").show();
                   $("#txtForMobNo").val("");
                   $("#txtOtp").val("");
                   $(".nototp").show();
                   $(".otpEnq").hide();

                   $("#txtFathMob1").attr("disabled", "disabled");
                   $("#txtFathMob1").attr("readonly", "readonly");
               }
               else
                   alert("invalid otp");
           })
           .error(function (data) {
               $("#btnVerify").removeAttr("readonly");
               alert("oops something went wrong please contact support");
           })
    }

    $scope.cancelOTP = function () {
        $("#txtOtp,#btnVerify").hide();
        $("#txtForMobNo,#btnSendOTP").show();
        $("#txtOtp").val("");
        $("#txtForMobNo").val("");
        $("#btnSendOTP").removeAttr("readonly");
        $("#btnVerify").removeAttr("readonly");
        $(".generateOTP").show();
        $(".enterOTP").hide();
    }

    /*load students for messaging start*/
    $scope.btnContacts = function () {
        if ($("#chatWindow").is(':visible') == false) {
            $('#contact-details').animate({ width: '100%' });
            $(".childClass").removeClass("checkDtlsDsgn");
            if ($("#showRecentList").attr("ng-initial") == "true") {
                $("#showRecentList").attr("ng-initial", "false");
                $("#contact-details").show();
                $("#showRecentList").hide();
            }
            else {
                $("#showRecentList").attr("ng-initial", "true");
                $("#showRecentList").show();
                $("#contact-details").hide();
            }
        }

        if (localStorage.getItem("isAdmin") == "false" && $("#chatWindow").is(':visible') == false) {
            $("#showRecentList").show();
            $("#contact-details").hide();
        }

        if ($("#chatWindow").is(':visible')) {
            if ($("#showRecentList").attr("ng-initial") == "true") {
                $("#showRecentList").show();
            }
            else {
                $("#contact-details").show();
            }

            if (localStorage.getItem("isAdmin") == "false") {
                $("#showRecentList").show();
                $("#contact-details").hide();
            }
        }
        $("#chatWindow").hide();

        if ($("#showRecentList").is(':visible')) {
            $(".title.title-left.header-item").text("Groups");
        }
        if ($("#contact-details").is(':visible')) {
            $(".title.title-left.header-item").text("Contacts");
        }

        if (localStorage.getItem("isAdmin") == "false")
            $(".title.title-left.header-item").text("Contacts");

        $(".title.title-center.header-item").show();
        $(".buttons.header-item").find(".title").hide();
    }

    $scope.loadContactsForMessaging = function () {
        $(".loader").css({ "display": "block" });
        $("#chatWindow").hide();
        if (localStorage.getItem("isAdmin") == "false") {
            $("#showRecentList").find(".ms-block").hide();
            $("#txtGroupSearch").parent().hide();
        }
        $('#contact-details').animate({ width: '0px' });

        //show contacts
        $("#backtoContacts").click(function () {
            if ($("#showRecentList").attr("ng-initial") == "true") {
                $("#showRecentList").show();
            }
            else {
                $("#contact-details").show();
            }
            $("#chatWindow").hide();
        });

        $("#btnContacts,#btnNewGroup").unbind().click(function () {
            $('#contact-details').animate({ width: '100%' });
            $(".childClass").removeClass("checkDtlsDsgn");
            if (this.id == "btnContacts") {
                if ($("#showRecentList").attr("ng-initial") == "true") {
                    $("#showRecentList").attr("ng-initial", "false");
                    $("#contact-details").show();
                    $("#showRecentList").hide();
                }
                else {
                    $("#showRecentList").attr("ng-initial", "true");
                    $("#showRecentList").show();
                    $("#contact-details").hide();
                }
            }
            //        if (this.id == "btnNewGroup") {
            //            isNewGroupClick = true;
            //            $("#deleteGroup").hide();
            //        }
        });

        //h ide contacts
        $("#clickForBack").unbind().click(function () {
            $('#contact-details').animate({ width: '0%' });
            $("#txtGroupSearch").focus();
            $("#showRecentList").attr("ng-initial", "true");
            $("#showRecentList").show();
            $("#contact-details").hide();
        });


        //search students
        $("#txtSearchContacts").unbind().keyup(function () {
            if ($("#txtSearchContacts").val() == "") {
                $(".childClass").hide();
                $(".childClass").addClass("checkDtlsDsgn");
            }
            else {
                $(".childClass").hide();
                $(".childClass").removeClass("checkDtlsDsgn");
                $.each($(".childClass").find(".name"), function (seachIndex, searchValues) {
                    if ($(searchValues).text().toUpperCase().indexOf($("#txtSearchContacts").val().toUpperCase()) > -1) {
                        searchValues.parentElement.parentNode.style = "display:block"
                        $(searchValues.parentElement.parentNode).addClass("checkDtlsDsgn");
                    }
                });
            }
        });

        //search groups
        $("#txtGroupSearch").unbind().keyup(function () {
            if ($("#txtGroupSearch").val() == "") {
                $(".groupDetails").show();
                $(".groupDetails").addClass("checkDtlsDsgn");
            }
            else {
                $(".groupDetails").removeClass("checkDtlsDsgn");
                $(".groupDetails").hide();
                $.each($(".groupDetails").find(".status"), function (seachIndex, searchValues) {
                    if ($(searchValues).text().toUpperCase().indexOf($("#txtGroupSearch").val().toUpperCase()) > -1) {
                        searchValues.parentElement.parentNode.style = "display:block"
                        $(searchValues.parentElement.parentNode).addClass("checkDtlsDsgn");
                    }
                });
            }
        });

        $http({
            method: 'POST',
            url: services.GetStudnetsForMessaging,
            data: { schoolId: localStorage.getItem("schoolId"), userId: localStorage.getItem("userId"), schoolName: localStorage.getItem("SchoolName") },
        })
        .success(function (data) {
            classList = [], studentsForMessaging = [];
            studentsForMessaging = data.d.StudentsMessagingList_Data;
            MessagingContacts = data.d.StudentsMessagingList_Data;
            $scope.MessagingContacts = data.d.StudentsMessagingList_Data;
            parentsForMessaging = data.d.ForParentsView;
            studentId = data.d.StudentId;

            $("#bindStudents").empty();
            var customHtml = "";
            $.each(studentsForMessaging, function (index, data) {
                var classIndex = classList.map(function (e) { return e.ClassId; }).indexOf(data.ClassId)
                if (classIndex == -1)
                    classList.push({ ClassId: data.ClassId, ClassName: data.ClassName });
            });
            loadCustomGroupDetails($http, $scope); // load group details
            $.each(classList, function (clsIndex, clsData) {
                customHtml += '<div class="row customRowStyles parentClass parent_' + clsData.ClassId + ' checkDtlsDsgn">';
                //                customHtml += '<div class="leftAlign col-20">';
                //                customHtml += '<div ng-classId-click="' + clsData.ClassId + '" class="class-group-image">'
                //                                +'<img src="../../img/ClassGroupIcon.png"/></div>';
                //                customHtml += '</div>';
                customHtml += '<div class="rightAlign col-80" style="height: 25px;left: 2%;">';
                customHtml += '<div class="student-names status vCenter">' + clsData.ClassName + '</div>';//ng-classId-click="' + clsData.ClassId + '" 
                customHtml += '</div></div>';
                $.each(studentsForMessaging, function (index, data) {
                    if (clsData.ClassId == data.ClassId) {
                        customHtml += '<div title="' + data.StudentName + '" ng-studentid="' + data.StudentId + '" ng-isdefault-group ="-" id="groupStudents_' + data.StudentId + '" class="row customRowStyles childClass child_' + data.ClassId + ' checkDtlsDsgn" style="padding-left: 3%;">';
                        customHtml += '<div class="leftAlign col-20">';
                        customHtml += '<div class="student-image" for="' + data.StudentImagePath + '">' + '<img src="' + data.StudentImagePath + '"/></div>';
                        customHtml += '</div>';
                        customHtml += '<div class="rightAlign col-80">';
                        customHtml += '<div class="name vCenter student_' + data.StudentId + '">' + data.StudentName.trim() + '</div>';
                        customHtml += '</div></div>';
                    }
                });
            });

            $("#bindStudents").append(customHtml);

            if (localStorage.getItem("isAdmin") == "false") {
                $(".parentClass").css("pointer-events", "none");
                $(".childClass").css("pointer-events", "none");
                $(".parentClass").hide();
            }
            $(".parentClass").unbind().click(function () {
                if ($("#groupSelectiondetails").is(":visible") == false) {
                    var clsId = this.classList[this.classList.length - 1].split("_")[1];
                    if ($(".child_" + clsId).is(":visible")) {
                        $(".child_" + clsId).hide();
                    }
                    else
                        $(".child_" + clsId).show();
                }
            });

            $(".class-group-image").unbind().click(function () {
                if ($("#groupSelectiondetails").is(":visible")) {
                    var clsId = $(this).attr("ng-classId-click");
                    $(".child_" + clsId).show();
                    $.each(studentsForMessaging, function (index, data) {
                        if (clsId == data.ClassId.toString()) {
                            if ($("#groupStudents_" + data.StudentId).hasClass("addedForGroup") == false)
                                $("#groupStudents_" + data.StudentId).click();
                        }
                    });
                }
            });

            $(".student-names").unbind().click(function () {
                if ($("#groupSelectiondetails").is(":visible")) {
                    var clsId = $(this).attr("ng-classId-click");
                    if ($(".child_" + clsId).is(":visible")) {
                        $(".child_" + clsId).hide();
                    }
                    else
                        $(".child_" + clsId).show();
                }
            });


            $(".childClass").unbind().click(function () {
                var studentId = $(this).find('.name')[0].classList[2].split("_")[1];
                //check for student selections
                //if ($("#groupSelectiondetails").is(":visible") == false) {
                $("#currentselections").text($(this).attr("title"));

                /*set group selection attributes start */
                var studentId = $(this).attr("ng-studentid");
                var isDefaultGroup = $(this).attr("ng-isdefault-group");
                $("#view-Group-students").attr("ng-selected-group", studentId);
                $("#view-Group-students").attr("ng-isdefault-group", isDefaultGroup);
                $("#view-Group-students").attr("ng-isgroup", false);
                /*set group selection attributes end */

                $(".title.header-item").hide();
                $(".buttons.header-item").find(".title").css("display", "block");
                $("#selected-logo").attr("src", $(this).find(".student-image").attr("for"));
                $(".childClass").removeClass("studentSelected");
                $(this).addClass("studentSelected");
                $(".ms-empty-body").hide();
                $("#msg-content").empty();
                $("#txtMessaging").focus();

                $scope.loadSelectedStudentMsgDetails(true);
                $("#showRecentList,#contact-details").hide();
                $("#chatWindow").show();
                $(".title.title-left.header-item").text("Chat");
                //                    return false;
                //                }
                //                //check for group selections
                //                if ($(this).hasClass("addedForGroup")) {
                //                    $(".groupStu_" + studentId + "").remove();
                //                    $(this).find('.student-image').removeClass("student-group-image");
                //                    $(this).removeClass("addedForGroup");
                //                
                //                }
                //                else {
                //                    var selectedElement = '<div class="row groupSelStudents groupStu_' + studentId + '" >';
                //                    selectedElement += '<div class="col-md-10 eachSelection">';
                //                    selectedElement += '<span class="contact-name">' + $(this).find('.name').text().trim() + '</span>';
                //                    selectedElement += '<span class="contact-remove" for="groupStu_' + studentId + '" title="remove selection">X</span>';
                //                    selectedElement += '</div></div>';
                //                    $("#groupSelectiondetails").append(selectedElement);
                //                    $(this).addClass("addedForGroup");
                //                    $(this).find('.student-image').addClass("student-group-image");

                //                    $(".contact-remove").unbind().click(function () {
                //                        var studentid = $(this).attr("for").split("_")[1];
                //                        $(".groupStu_" + studentid).remove();
                //                        $("#groupStudents_" + studentid).find('.student-image').removeClass("student-group-image");
                //                        $("#groupStudents_" + studentid).removeClass("addedForGroup");
                //                    });
                //                }
            });
            if (localStorage.getItem("isAdmin") == "false")
                $(".title.title-left.header-item").text("Contacts");
            else
                $(".title.title-left.header-item").text("Groups");

            $(".loader").css({ "display": "none" });
        })
        .error(function (data) {
            $(".loader").css({ "display": "none" });
        });
    };

    $scope.searchMessagingContacts = function () {
        if ($("#txtSearchContacts").val() == "") {
            $(".childClass").show();
        }
        else {
            $(".childClass").hide();
            $.each($(".childClass").find(".msgStDtls"), function (seachIndex, searchValues) {
                if ($(searchValues).text().toUpperCase().indexOf($("#txtSearchContacts").val().toUpperCase()) > -1) {
                    searchValues.parentElement.parentNode.style = "display:block"
                }
            });
        }
    }

    $scope.myGoBack = function () {
        if (localStorage.getItem("isAdmin") == "true")
            $state.go('app.chat');
        else
            $state.go('app.dashboard');

        $timeout(function () {
            hideMenuClick();
        });
    };

    $scope.chatOpen = function () {
        //if(localStorage.getItem("isAdmin") == "true")
        $state.go('app.chat');
        //    else
        //        $state.go('app.chatwindow');
    }

    setInterval(function () {
        if (localStorage.getItem("userId") != null && localStorage.getItem("userId") != 'null')
            $scope.loadSelectedStudentMsgDetails(false);
    }, 2000);

    $scope.loadSelectedStudentMsgDetails = function ($event) {
        if ($event)
            $(".loader").css({ "display": "block" });
        var request = {};
        request.userId = localStorage.getItem("userId");
        request.schoolId = localStorage.getItem("schoolId");
        request.isSchool = false;
        if (localStorage.getItem("isAdmin") == "true")
            request.isSchool = true;

        if ($("#view-Group-students").attr("ng-isdefault-group") == "-" && localStorage.getItem("isAdmin") == "false")
            request.TypeId = studentId;
        else {
            request.TypeId = $("#view-Group-students").attr("ng-selected-group");
        }
        $(".parent_" + request.TypeId).find(".unreadCount").remove();

        if (request.TypeId == undefined) {
            $(".loader").css({ "display": "none" });
            return false;
        }

        $http({
            method: 'POST',
            url: services.GetIndividualMessaging,
            data: { schoolId: request.schoolId, userId: request.userId, typeId: request.TypeId, isSchool: request.isSchool },
        }).success(function (response) {
            $("#msg-content").empty();
            getMessagesList = response.d.GetMessagesList_Data;
            $.each(getMessagesList, function (a, b) {
                $scope.bindMessaging(b.Message, b.Float, b.StudentName, b.MsgDate);
            });
            if (getMessagesList.length == 0)
                $("#chatWindow .ms-empty-body").show();
            else
                $("#chatWindow .ms-empty-body").hide();
            if ($event)
                $("#msg-content").animate({ scrollTop: $("#msg-content div").height() * 72 }, "fast");
            $(".loader").css({ "display": "none" });
        }).error(function (response) {
            $(".loader").css({ "display": "none" });

        });
    }

    $scope.get_timeStamp = function () {
        var param1 = new Date();
        return param1.getDate() + '/' + (param1.getMonth() + 1) + '/' + param1.getFullYear() + ' ' + param1.getHours() + ':' + param1.getMinutes() + ':' + param1.getSeconds();
    }

    $scope.bindMessaging = function (msg, float, studentName, msgDate) {
        //msgDate = (msgDate == undefined ? $scope.get_timeStamp() : msgDate);
        msgDate = (msgDate == undefined ? "" : msgDate);
        //        var bind_Message = "";
        //        bind_Message = '<div class="lv-item media pull-' + float + '" style="width:100%;">';
        //        bind_Message += '<div class="lv-avatar pull-' + float + '">';
        //        bind_Message += '<img src="' + $("#selected-logo").attr("src") + '" alt="">';
        //        bind_Message += '</div>';
        //        bind_Message += '<div class="media-body pull-' + float + '">';
        //        bind_Message += '<div class="ms-item">';
        //        if (studentName != '' && studentName != undefined)
        //            bind_Message += '<div class ="student-name">' + studentName + '</div>';
        //        bind_Message += msg;
        //        bind_Message += '</div>';
        //        bind_Message += '<small class="ms-date"><span class="glyphicon glyphicon-time" style="visibility: hidden;"></span>&nbsp;' + msgDate + '</small>';
        //        bind_Message += '</div>';
        //        bind_Message += '</div>';
        //        if(flag == 0){
        //            float="left";
        //            flag=1;
        //        }
        //        else{
        //            float="right";
        //            flag=0;
        //        }
        var bind_Message = "";
        bind_Message = '<div class="lv-item media pull-' + float + '" style="width:100%;">';
        bind_Message += '<div class="messageRectangle pull-' + float + '">';
        //        bind_Message +='<div class="lv-avatar pull-' + float + '">';
        //        bind_Message +='<img src="' + $("#selected-logo").attr("src") + '" alt="">';
        //        bind_Message +='</div>';
        bind_Message += '<div class="media-body pull-' + float + '">';
        bind_Message += '<div class="ms-item">';
        if (studentName != '' && studentName != undefined)
            bind_Message += '<div class ="student-name">' + studentName + '</div>';
        bind_Message += '<div class="messageText">' + msg + '</div>';
        bind_Message += '</div>';
        bind_Message += '</div></div>';
        bind_Message += '<small class="ms-date pull-' + float + '"><span class="glyphicon glyphicon-time" style="visibility: hidden;"></span>&nbsp;' + msgDate + '</small>';
        bind_Message += '<div class="messageArrow pull-' + float + '"></div>';
        bind_Message += '</div>';
        $("#msg-content").append(bind_Message);
    }
    $scope.hideTime = true;

    var alternate,
      isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();

    $scope.sendChatMessage = function () {
        if ($("#txtMessaging").val().trim() == "") {
            alert('message text should not be empty');
            return false;
        }
        $scope.bindMessaging($("#txtMessaging").val().trim(), 'right');
        $("#msg-content").animate({ scrollTop: $("#msg-content div").height() * 72 }, "fast");
        alternate = !alternate;

        var d = new Date();
        d = d.toLocaleTimeString().replace(/:\d+ /, ' ');

        $ionicScrollDelegate.scrollBottom(true);
        var selectedGroupId = parseInt($("#view-Group-students").attr("ng-selected-group"));
        var checkNameType = $("#view-Group-students").attr("ng-isdefault-group");
        var request = {};
        var receiverIds = "";
        if (checkNameType == "-") {
            receiverIds = selectedGroupId + "|";
            if (localStorage.getItem("isAdmin") == "true")
                request.ReceivedType = 2;
            else {
                request.ReceivedType = 1;
            }
        }
        else if (checkNameType == "1") {
            $.each(studentsForMessaging, function (index, value) {
                if (localStorage.getItem("isAdmin") == "true") {
                    if (value.ClassId == selectedGroupId) {
                        receiverIds += value.StudentId + "|";
                    }
                }
                else {
                    if (value.ClassId == selectedGroupId && value.UserId.toString() == localStorage.getItem("userId").toString()) {
                        receiverIds += value.StudentId + "|";
                    }
                }
            });
            request.ReceivedType = 3; //for group
        }
        else if (checkNameType == "0") {
            $.each(studentsForCustomGroup, function (index, value) {
                if (localStorage.getItem("isAdmin") == "true") {
                    if (value.ClassId == selectedGroupId) {
                        receiverIds += value.StudentId + "|";
                    }
                }
                else {
                    if (value.ClassId == selectedGroupId && value.UserId.toString() == localStorage.getItem("userId").toString()) {
                        receiverIds += value.StudentId + "|";
                    }
                }
            });
            request.ReceivedType = 4; //for custom group
        }
        receiverIds = receiverIds.substr(0, receiverIds.length - 1);
        request.SenderId = localStorage.getItem("userId");
        request.ReceiverIds = receiverIds;
        request.Messaging = $("#txtMessaging").val().trim();
        request.IsImage = false;
        request.IsVideo = false;
        request.IsFile = false;
        if ($("#view-Group-students").attr("ng-isdefault-group") == "-" && localStorage.getItem("isAdmin") == "false")
            request.TypeId = studentId;
        else
            request.TypeId = $("#view-Group-students").attr("ng-selected-group");

        request.SchoolId = localStorage.getItem("schoolId");

        /*subscribe for notifications start*/
        if (window.cordova) {
            if (localStorage.getItem("isAdmin") != "true") {
                FCMPlugin.subscribeToTopic(localStorage.getItem("schoolId") + "schoolId");
            }
            else {
                $.each(receiverIds.split("|"), function (_a, _b) {
                    FCMPlugin.subscribeToTopic(_b);
                })
            }
        }
        /*subscribe for notifications end*/

        $http({
            method: 'POST',
            url: services.SendMessaging,
            data: {
                senderId: request.SenderId, receiverIds: request.ReceiverIds, messaging: request.Messaging,
                isImage: request.IsImage, isVideo: request.IsVideo, isFile: request.IsFile,
                receivedType: request.ReceivedType, typeId: request.TypeId, schoolId: request.SchoolId
            },
        }).success(function (data) {
            $scope.sendNotification($("#txtMessaging").val(), receiverIds, "School Dairy");
            $("#txtMessaging").val("");
        }).error(function (data) {
            $("#txtMessaging").val("");
        });
    };

    $scope.data = {};
    $scope.myId = localStorage.getItem("userId");//request.SenderId;
    $scope.messages = [];
    /*load students for messaging end*/

    /*notifications start*/
    ionic.Platform.ready(function () {

        $scope.goBack = function () {
            $state.go('app.dashboard', {}, { location: "replace", reload: true });
        }

        if (window.cordova) {
            //Notifications
            //FCMPlugin.subscribeToTopic('all');

            FCMPlugin.onNotification(function (data) {
                var isIOS = ionic.Platform.isIOS();
                console.log("data ",data);
                var notificationData =JSON.parse(data["gcm.notification.data"]);
                var alertMessage = { "alert": notificationData };

                $rootScope.$broadcast('Notification-Received');
                if (data.wasTapped) {
                    $rootScope.$broadcast('Notification-Tapped', data);
                    //Notification was received on device tray and tapped by the user.
                    // alert(JSON.stringify(data));
                }

                if (isIOS) {
                    showConfirmForiOSNotification(data.aps.alert, alertMessage)
                }

            });
        }

        $scope.$on("$ionicView.beforeEnter", function (event) {
            readDatabase();
        });

        $scope.$on('Notification-Received', function (event, args) {
            readDatabase();
        });

        $scope.$on('Notification-Tapped', function (event, args) {
            upDateDB(args.messageId);
        });

        function readDatabase() {
            if (window.cordova) {
                FCMPlugin.getAllNotifications(
                    function (successobj) {
                        console.log(JSON.stringify(successobj))
                        if (successobj.length == 0) {
                            $scope.nodata = true;
                        } else {
                            $scope.nodata = false;
                            $scope.listOfObjects = successobj;
                            var listOfObjectswithFlagTrue = [];

                            for (var i = 0; i < successobj.length; i++) {
                                if (successobj[i].flag == "false") {
                                    listOfObjectswithFlagTrue.push(successobj[i]);
                                }
                            }
                            $scope.unreadMesgsCount = listOfObjectswithFlagTrue.length;
                        }
                        $timeout(function () {
                            console.log("Dont take me out App wont work otherwise");
                        }, 400);
                    });
            }
        }

        $scope.markMessageRead = function (Object) {
            upDateDB(Object.messageId)
        }

        function upDateDB(id) {
            FCMPlugin.markInboxMessageRead(id, function (successobj) {
                readDatabase();
            });
        }

        $scope.sendNotification = function (notificationMessage, receiverIds, title) {
            if (window.cordova) {
                if (localStorage.getItem("isAdmin") == "true")
                    FCMPlugin.getMessageBy(localStorage.getItem("schoolId") + "schoolId");
                else
                    FCMPlugin.getMessageBy(localStorage.getItem("studentId"));
            }

            if (localStorage.getItem("isAdmin") != "true")
                receiverIds = localStorage.getItem("schoolId") + "schoolId";

            $.each(receiverIds.split("|"), function (_a, _b) {
                var body = {
                    "data": {
                        "title": title,
                        "body": notificationMessage,
                        "messageId": guid(),
                        "messageBy": (localStorage.getItem("isAdmin") == "true" ? (localStorage.getItem("schoolId") + "schoolId") : (localStorage.getItem("studentId"))),
                        "extraData": ""
                    },
                    "to": "/topics/" + _b,
                    "priority": "high",
                    "restricted_package_name": "com.littleconnect.phonegap"
                }
                console.log(JSON.stringify(body))
                $http({
                    method: 'POST',
                    data: JSON.stringify(body),
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'key=' + FCMAuthToken },
                    url: ' https://fcm.googleapis.com/fcm/send'
                }).then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    console.log(response.data);
                    /*subscribe for unnotifications start*/
                    if (window.cordova) {
                        if (localStorage.getItem("isAdmin") != "true") {
                            FCMPlugin.unsubscribeFromTopic(localStorage.getItem("schoolId") + "schoolId");
                        }
                        else {
                            //$.each(receiverIds.split("|"), function (_a, _b) {
                            FCMPlugin.unsubscribeFromTopic(_b);
                            //})
                        }
                    }
                    /*subscribe for unnotifications end*/
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
            });
            $("#txtMessaging").val("");
        }


        $scope.showConfirmForiOSNotification = function(data,message) {
            var isIOS = ionic.Platform.isIOS();
            var title;
            var body;
            if (isIOS) {
                title = data.title
                body = data.body
            }else
            {
                title = data["gcm.notification.title"]
                body = data["gcm.notification.body"]
            }
            var confirmPopup = $ionicPopup.alert({
                title: title,
                template: body
            }).then(function (res) {
                if (res) {
                    console.log('res'); 
                } else {
                    console.log('dont open');
                }
            });
        };
    });
    /*notifications end*/

    /*fee management start*/
    $ionicModal.fromTemplateUrl('templates/addFeeReceipt.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.addFeeReceipt = modal;
    });
    $scope.loadReceipts = function () {
        $(".loader").css({ "display": "block" });
        $http({
            method: 'POST',
            url: services.LoadAllReceipts,
            data: { schoolId: localStorage.getItem("schoolId"), type: (localStorage.getItem("isAdmin") == "true" ? 1 : 0) },
        }).success(function (response) {
            responseData = response.d.ReceiptListData.sort(function (c, d) {
                a = c.ReceiptDate.split(" ");
                b = d.ReceiptDate.split(" ");
                return (new Date(b[1] + " " + b[2] + " " + b[0]) - new Date(a[1] + " " + a[2] + " " + a[0]))
            })
            $scope.receipts = responseData;
            $(".loader").css({ "display": "none" });
        }).error(function (response) {
            $(".loader").css({ "display": "none" });

        });
    }
    $scope.loadReceipts();

    $ionicModal.fromTemplateUrl('templates/detailedFeeReceipt.html', {
        scope: $scope
    }).then(function (modal) {
        try {
        }
        catch (ex) { }
        $scope.detailedReceipts = modal;
    });

    $scope.detailedReceipt = function (receiptDetails) {
        $(".loader").css({ "display": "block" });
        $http({
            method: 'POST',
            url: services.GetSelectedReceiptData,
            data: { feeReceiptID: receiptDetails.FeeReceiptID, type: (localStorage.getItem("isAdmin") == "true" ? 1 : 0) },
        }).success(function (response) {
            receiptTemp = response.d.GetFeeHeadReciptData[0];
            receipt = {};
            receipt.data = response.d.GetFeeHeadReciptData;
            receipt.Balance = response.d.Balance;
            receipt.PendingAmount = response.d.PendingAmount;
            receipt.ReceivedAmount = response.d.ReceivedAmount;
            receipt.ReceiptDate = receiptDetails.ReceiptDate;
            receipt.status = "overdue";
            receipt.className = receipt.status.toUpperCase() == "OVERDUE" ? "orange" : (receipt.status.toUpperCase() == "PAID" ? "green" : "grey");
            receipt.StudentName = receiptDetails.StudentName.split("|")[0] + " - " + receiptDetails.ClassName;
            receipt.ReceiptNumber = receiptDetails.ReceiptNo;
            receipt.IsValid = response.d.IsValid;
            $scope.detailedFeeReceipt = receipt;
            $scope.detailedReceipts.show();
            $(".loader").css({ "display": "none" });
        }).error(function (response) {
            $(".loader").css({ "display": "none" });

        });
    }

    $ionicModal.fromTemplateUrl('templates/addAllottedStudentsList.html', {
        scope: $scope
    }).then(function (modal) {

        $http({
            method: 'POST',
            url: services.GetStudentNamesForAdmissionEntrySearchApp,
            data: { schoolId: localStorage.getItem("schoolId"), type: (localStorage.getItem("isAdmin") == "true" ? 1 : 0) },
        }).success(function (response) {

            $scope.allotedStudents = response.d.StudentsListForFeeReceiptData;
            $(".loader").css({ "display": "none" });
        }).error(function (response) {
            $(".loader").css({ "display": "none" });

        });
        $scope.addAllottedStudentsList = modal;
    });


    /*add student details start*/
    $scope.addStudent = function (student) {
        $(".loader").css({ "display": "block" });
        var student_Selection = "";
        student_Selection = student.StudentName.split(" - ")[1];
        classId = student.ClassId;
        studentId = student.StudentID;
        if (student_Selection != "") {
            $(".studentName").text(student_Selection);
            $(".studentName").attr("classId", classId);
            $(".studentName").attr("studentId", studentId);
            $(".add-client").hide();
        }
        else {
            alert("students selections are mandatory");
            $event.stopPropagation();
        }
        angular.element(document.getElementsByClassName("students")).prop("checked", false);

        $scope.feeList = [], feeTypeList = [];
        feeDetails = [];
        $http({
            method: 'POST',
            url: "http://www.app.meritmerge.com/FeeManagement.asmx/GetHeadReceiptDataList",
            data: { schoolID: localStorage.getItem("schoolId"), classID: $(".studentName").attr("classId"), studentID: $(".studentName").attr("studentId"), type: 1 }
        }).success(function (response) {
            data = response.d.GetFeeHeadReciptData;
            for (i = 0; i < data.length; i++) {
                receiptsDetails.rcvdAmt = receiptsDetails.rcvdAmt + data[i].CumAmt;
                if (feeTypeList.indexOf(data[i].FeeTypeName) == -1) {
                    feeTypeList.push(data[i].FeeTypeName);
                    feeDetails.push(data[i]);
                }
            }
            receiptsDetails.pendingAmt = response.d.PendingAmount;
            receiptsDetails.rcvdNo = response.d.ReceiptNo;
            $(".invoiceNo input").val(receiptsDetails.rcvdNo);
            $(".loader").css({ "display": "none" });
            addedItem = [];
            $(".removeDiv").remove();

            $scope.feeList = feeDetails;
        }).error(function (response) {
            $(".loader").css({ "display": "none" });

        });

        $scope.addAllottedStudentsList.hide();
    }
    /*add student details end*/
    $scope.openAddReceipt = function () {
        $(".loader").css({ "display": "block" });
        $scope.addFeeReceipt.show();
        $(".add-client").show();
        $(".studentName").text("Add Student");
        $(".removeDiv").remove();
        $(".invoiceNo input").val("");
        $('.addFeeReceiptTemplate .invoiceDate input').val(day + ' ' + monthsList[parseInt(month) - 1] + ' ' + now.getFullYear());
        $(".loader").css({ "display": "none" });
    }

    $ionicModal.fromTemplateUrl('templates/FeeReceiptItem.html', {
        scope: $scope
    }).then(function (modal) {
        try {
        }
        catch (ex) { }
        $scope.addReceiptItems = modal;
    });


    $scope.addReceiptFields = function () {
        if (feeDetails.length == 0) {
            alert("Select Student");
            return false;
        }
        $scope.addReceiptItems.show();
        $('.addFeeReceiptTemplate .invoiceDate span:not(.arrow)').text(day + ' ' + monthsList[parseInt(month) - 1] + ' ' + now.getFullYear());
    }

    $scope.saveFeeReceipt = function () {
        $(".loader").css({ "display": "block" });
        request = {};
        request.FeeHeadReceiptID = 0;
        request.SchoolID = localStorage.getItem("schoolId");
        request.ClassID = $(".studentName").attr("classId");
        request.StudentID = $(".studentName").attr("studentId");
        request.ReceiptNo = receiptsDetails.rcvdNo;
        request.ReceiptDate = $('.addFeeReceiptTemplate .invoiceDate input').val();
        request.PendingAmount = receiptsDetails.pendingAmt;
        request.ReceivedAmount = (parseFloat(receiptsDetails.rcvdAmt) + parseFloat($("#RcptAmt").val())).toFixed(2);
        request.Balance = (request.PendingAmount - request.ReceivedAmount).toFixed(2);
        request.Remarks = $("#itemDescription").val();
        request.UserID = localStorage.getItem("userId");
        $http({
            method: 'POST',
            url: services.AddEditHeadReceiptDataHead,
            data: request,
        }).success(function (response) {

            FeeHeadReceiptID = response.d.ResponseCode;
            count = 0;
            for (i = 0; i < addedItem.length; i++) {
                request = {};
                request.FeeHeadReceiptID = FeeHeadReceiptID;
                request.FeeTypeID = addedItem[i].FeeTypeID;
                request.FeeTypeAmt = addedItem[i].FeeTypeAmt.toFixed(2);
                request.Rcvd = addedItem[i].Rcvd == "N" ? 0 : 1;
                request.RcvdAmt = addedItem[i].RcvdAmt.toFixed(2);
                request.Status = 1;

                $http({
                    method: 'POST',
                    url: services.AddEditHeadReceiptDataDetail,
                    data: request,
                }).success(function (response) {
                    count++;
                    if (count == addedItem.length)
                        alert("Receipt Added Successfully");
                    $(".loader").css({ "display": "none" });
                    $scope.addFeeReceipt.hide();
                }).error(function (response) {
                    $(".loader").css({ "display": "none" });
                });
            }

        }).error(function (response) {
            $(".loader").css({ "display": "none" });

        });
    }


    $ionicModal.fromTemplateUrl('templates/FeeTypeItem.html', {
        scope: $scope
    }).then(function (modal) {
        try {
            $scope.feeTypeList = modal;
        }
        catch (ex) { }
    });

    $scope.addFeeItemType = function (item) {
        $(".itemName").text(item.FeeTypeName);
        $(".itemName").attr("feeid", item.FeeTypeId);
        $("#RcptAmt").val(item.RcvdAmt.toFixed(2));
        $scope.feeTypeList.hide()
    }
    addedItem = [];
    $scope.addItem = function () {
        if ($(".itemName").text() == "Select Item") {
            alert("Please select fee type");
            return false;
        }
        for (i = 0; i < feeDetails.length; i++) {
            if (feeDetails[i].FeeTypeName == $(".itemName").text())
                break;
        }

        statusflag = 0;
        for (j = 0; j < addedItem.length; j++) {
            if (addedItem[j].FeeTypeName == $(".itemName").text()) {
                statusflag = 1;
                break;
            }
        }
        if (statusflag == 1)
            addedItem.splice(j, 1);
        addedItem.push(feeDetails[i]);
        $(".removeDiv").remove();
        $scope.addReceiptItems.hide();
        customHtml = "";
        for (i = 0; i < addedItem.length; i++) {
            customHtml += '<div class="row list-item removeDiv">' +
                                    '<div class="leftAlign col-50">' +
                                            '<div class="deleteIcon" ng-click="deleteEntry($event)" style="display:inline-block;"><div class="innerCircle"><div class="middleAlign"><span> - </span></div></div></div>' +
	        		                	    '<div style="display:inline-block;">' +
                                                '<div style="display:block;font-weight:bold">' + addedItem[i].FeeTypeName + '</div>' +
	        		                	        '<div style="display:block">Inst Amt &nbsp;:&nbsp' + addedItem[i].RcvdAmt + '</div>' +
                                                '<div style="display:block">Cum Amt &nbsp;:&nbsp' + addedItem[i].CumAmt + '</div>' +
                                            '</div>' +
                                    '</div>' +
                                    '<div class="rightAlign col-50">' +
                                         '<div style="display:block;font-weight:bold">Received Amt</div>' +
                                         '<div style="display:block;font-weight:bold;margin-top:20px">Rs.' + addedItem[i].RcvdAmt + '</div>' +
                                    '</div>' +
                            '</div>';
        }
        $(".add-client").parent().prepend($compile(customHtml)($scope));
        $(".itemName").text("Select Item");
        $("#RcptAmt").val("0.00");
    }

    $scope.deleteEntry = function ($event) {
        $($event.currentTarget).parents(".removeDiv").remove();
    }
    /*fee management end*/


    /*pupil register start*/

    $ionicModal.fromTemplateUrl('templates/pupilRegister.html', {
        scope: $scope
    }).then(function (modal) {
        try {
            $scope.pupilRegisterLoad = modal;
            $http({
                method: 'POST',
                url: services.GetStudentCreation_App,
                data: { schoolId: localStorage.getItem("schoolId"), type: 6, studentId: 0 },
            }).success(function (response) {
                finalList = [];
                tempList = response.d.GetStudentsList;
                for (i = 0; i < tempList.length; i++) {
                    obj = {};
                    obj.StudentId = tempList[i].StudentId;
                    obj.AdmissionNo = tempList[i].AdmissionNo;
                    obj.StudentName = tempList[i].FirstName + " " + tempList[i].MiddleName + " " + tempList[i].LastName;
                    obj.ClassName = tempList[i].className;
                    obj.ClassId = tempList[i].ClassId;
                    obj.FathMob1 = tempList[i].FathMob1;
                    obj.FathMob2 = tempList[i].FathMob2;
                    obj.MothMob1 = tempList[i].MothMob1;
                    obj.MothMob2 = tempList[i].MothMob2;
                    finalList.push(obj);
                }
                $scope.pupilContacts = finalList;
                $(".loader").css({ "display": "none" });
            }).error(function (response) {
                $(".loader").css({ "display": "none" });
            });
        }
        catch (ex) { }
    });

    $scope.callPopup = function (item) {
        $(".showCustomPopup .customPopUpSecond").hide();
        if (item != undefined) {
            parentContacts = item;
        }
        appendData1 = "", appendData2 = "";
        if (!(parentContacts.FathMob1 == "" && parentContacts.FathMob2 == "" && parentContacts.MothMob1 == "" && parentContacts.MothMob2 == "")) {
            if (!(parentContacts.FathMob1 == "" && parentContacts.FathMob2 == ""))
                appendData1 = "<div ng-click=\"showContacts('Father')\">" + "Father" + "</div>";
            if (!(parentContacts.MothMob1 == "" && parentContacts.MothMob2 == ""))
                appendData2 = "<div ng-click=\"showContacts('Mother')\">" + "Mother" + "</div>";
            customHtml = "<div class='customPopUp customPopUpFirst'>" +
                        "<div class='Msg'>" + "Whom would you like to call ?" + "</div>" +
                        "<div class='option'>" +
                            appendData1 +
                            appendData2 +
                        "</div>" +
                    "</div>";
        }
        else {
            customHtml = "<div class='customPopUp customPopUpFirst'>" + "<div class='Msg'><div class='noContacts'>" + "No Contacts Available" + "</div></div>" + "</div>"
        }
        $(".showCustomPopup .customPopUpFirst").remove();
        $(".showCustomPopup .popupBody").append($compile(customHtml)($scope));
        $(".overlay").show();
        $(".showCustomPopup").show();
        $(".modal-backdrop.active").css("pointer-events", "none");
        $(".showCustomPopup .customPopUpFirst").show();
    }

    $scope.showContacts = function (parent) {
        $(".showCustomPopup .customPopUpFirst").hide();
        no1 = "", no2 = "";
        if (parent == "Father") {
            no1 = parentContacts.FathMob1;
            no2 = parentContacts.FathMob2;
        }
        else if (parent == "Mother") {
            no1 = parentContacts.MothMob1;
            no2 = parentContacts.MothMob2;
        }
        customHtml = '<div class="customPopUp customPopUpSecond">' +
                        '<div class="Msg">' + "Choose number" + "</div>" +
                        "<div class='option'>" +
                            "<div><a href='tel:" + no1 + "'>" + no1 + "</a></div>" +
                            "<div><a href='tel:" + no2 + "'>" + no2 + "</a></div>" +
                        "</div>" +
                     '</div>'
        if ($(".showCustomPopup .popupBack").length == 0)
            $(".showCustomPopup .popupHeader").prepend("<div class='popupBack' onclick=\"$('.showCustomPopup .customPopUpFirst').show();$('.showCustomPopup .customPopUpSecond').hide();$('.showCustomPopup .popupBack').hide();\"> < <div>")
        $(".showCustomPopup .customPopUpSecond").remove();
        $(".showCustomPopup .popupBody").append($compile(customHtml)($scope));
        $(".showCustomPopup .customPopUpSecond").show();
        $('.showCustomPopup .popupBack').show();
    }

    $scope.closeCustomPopup = function () {
        $(".overlay").hide();
        $(".showCustomPopup").hide();
        $(".modal-backdrop.active").css("pointer-events", "auto");
    }

    $ionicModal.fromTemplateUrl('templates/pupilRegisterAddTemplate.html', {
        scope: $scope
    }).then(function (modal) {
        try {
            $http({
                method: 'POST',
                url: services.ClassNamesForAttendance,
                data: { schoolId: localStorage.getItem("schoolId") }
            })
                .success(function (data) {
                    $scope.attendanceClass = data.d.AttendenceClass;
                    $scope.genderList = ["Male", "Female"];
                    $scope.pupilRegisterAdd = modal;
                    $scope.pupilRegisterParameters = [
                    { type: "text", name: 'Admission No', required: "required", class: "admNo" },
                    { type: "text", name: 'Class', required: "required", class: "className" },
                    { type: "text", name: 'First Name', required: "required", class: "firstName" },
                    { type: "text", name: 'Middle Name', required: "", class: "middleName" },
                    { type: "text", name: 'Last Name', required: "required", class: "lastName" },
                    { type: "text", name: 'Username', required: "required", class: "username" },
                    { type: "password", name: 'Password', required: "required", class: "password" },
                    { type: "text", name: 'Date of Birth (dd-mm-yyyy)', required: "required", class: "dateofbirth" },
                    { type: "text", name: 'Father Name', required: "required", class: "fatherName" },
                    //{type:"email",name:'Father Email ID',required:"", class:"fatherMailId"},
                    { type: "text", name: 'Father Mobile No', required: "", class: "fatherMobNo" },
                    //{type:"text",name:'Mother Name',required:"required", class:"motherName"},
                    //{type:"email",name:'Mother Email ID',required:"", class:"motherMailId"},
                    //{type:"text",name:'Mother Mobile No',required:"", class:"motherMobNo"},
                    { type: "text", name: 'Gender', required: "required", class: "gender" }
                    ];
                })
                .error(function (data) {
                })

        }
        catch (ex) { }
    });

    $scope.openAddPupil = function () {
        $scope.pupilRegisterAdd.show();
        list = $scope.pupilRegisterParameters;
        for (i = 0; i < list.length; i++) {
            $(".formItem ." + list[i].class).val("");
            if (list[i].class == "className")
                $(".formItem ." + list[i].class).val("?");
        }
        schoolName = localStorage.getItem("SchoolName");
        $(".formItem .username").val(schoolName);
        $(".formItem .password").val(schoolName);
        $(".formItem .username").prop("disabled", "true");
        $(".formItem .password").prop("disabled", "true");
    }
    $scope.addPupilRecord = function () {
        list = $scope.pupilRegisterParameters;
        for (i = 0; i < list.length; i++) {
            if (list[i].required == "required") {
                if ($(".formItem ." + list[i].class).val() == "") {
                    $(".formItem ." + list[i].class).addClass("inputInvalid");
                    alert("Enter " + list[i].name);
                    return false;
                }
                else if ($(".formItem ." + list[i].class).val() == "?") {
                    $(".formItem ." + list[i].class).addClass("inputInvalid");
                    alert("Select a " + list[i].name);
                    return false;
                }
            }
                //            if(list[i].name == "Username"){
                //                value = $(".formItem ."+ list[i].class).val();
                //                if(value.indexOf(" ") > -1 || /^[a-zA-Z0-9- ]?$/.test(value) == true || /[0-9]/.test(value[0]) == true || /[A-Z]/.test(value) == false || /[0-9]/.test(value) == false)
                //                {
                //                    $(".formItem ."+ list[i].class).addClass("inputInvalid");
                //                    alert("Enter valid "+list[i].name+"\nUsername must contain one uppercase letter and one alphanumeric character and should not contain any special, must start with an alphabet");
                //                    return false;
                //                } 
                //            }
                //            else if(list[i].name == "Password"){
                //                value = $(".formItem ."+ list[i].class).val();
                //                if(/[a-z]/.test(value) == false || /[A-Z]/.test(value) == false || /[0-9]/.test(value) == false){
                //                    $(".formItem ."+ list[i].class).addClass("inputInvalid");
                //                    alert("Enter a valid " +list[i].name+ "\nPassword must be atleast eight characters including one uppercase letter, one special character and alphanumeric characters")
                //                    return false;
                //                }
                //            }
                //            else if(list[i].name =="Last Name" || list[i].name =="First Name" ){
                //                value = $(".formItem ."+ list[i].class).val();
                //                if(value!=""){
                //                    if(value.indexOf(" ") > -1 || /^[a-zA-Z0-9- ]*$/.test(value) == false)
                //                    {
                //                        $(".formItem ."+ list[i].class).addClass("inputInvalid");
                //                        alert("Enter valid "+list[i].name+"\n");
                //                        return false;
                //                    } 
                //                }
                //            }
            else if (list[i].class == "dateofbirth") {
                value = $(".formItem ." + list[i].class).val();
                if (value != "") {
                    if (new Date(monthsList[value.split("-")[1] - 1] + " " + value.split("-")[2] + " " + value.split("-")[0]) == "Invalid Date" || value.split("-")[0].length != 2 || value.split("-")[1].length != 2 || value.split("-")[2].length != 4) {
                        $(".formItem ." + list[i].class).addClass("inputInvalid");
                        alert("Enter valid " + list[i].name);
                        return false;
                    }
                }
            }
            //            else if(list[i].class =="fatherMobNo"){
            //                value = $(".formItem ."+ list[i].class).val();
            //                if(value !=""){
            //                    if (/^\d{10}$/.test(value) == false) {
            //                       alert("Enter valid "+list[i].name+"\nInvalid number; must be ten digits");
            //                       $(".formItem ."+ list[i].class).addClass("inputInvalid");
            //                       return false;
            //                    }
            //                }
            //            }
            $(".formItem ." + list[i].class).removeClass("inputInvalid");
        }

        request = {};
        request.schoolId = localStorage.getItem("schoolId");
        request.admissionNo = $(".formItem .admNo").val();
        request.classId = angular.element(document.querySelector("#options_cls")).val().split(":")[1];
        request.userName = $(".formItem .username").val().replace(/ /g, "") + "@meritmerge.com";
        request.pwd = $(".formItem .password").val().replace(/ /g, "");
        request.firstName = $(".formItem .firstName").val();
        request.lastName = $(".formItem .lastName").val();
        request.middleName = $(".formItem .middleName").val();
        dateofbirth = $(".formItem .dateofbirth").val();
        request.dob = dateofbirth.split("-")[0] + " " + monthsList[dateofbirth.split("-")[1] - 1] + " " + dateofbirth.split("-")[2];
        request.fatherName = $(".formItem .fatherName").val();
        request.fathMob1 = $(".formItem .fatherMobNo").val();
        request.gender = $(".formItem .gender").val() == null ? "" : $(".formItem .gender").val()[0].toUpperCase();

        $http({
            method: 'POST',
            url: services.AddStudentFromApp,
            data: request,
        }).success(function (response) {
            //$scope.pupilRegisterAdd.hide();
            $(".loader").css({ "display": "none" });
            if (response.d.ResponseMessage != null)
                alert(response.d.ResponseMessage);
        }).error(function (response) {
            $(".loader").css({ "display": "none" });
        });
    }
    /*pupil register end*/
})
//.directive('input', function ($timeout) {
//    return {
//        restrict: 'E',
//        scope: {
//            'returnClose': '=',
//            'onReturn': '&',
//            'onFocus': '&',
//            'onBlur': '&'
//        },
//        link: function (scope, element, attr) {
//            element.bind('focus', function (e) {
//                if (scope.onFocus) {
//                    $timeout(function () {
//                        scope.onFocus();
//                    });
//                }
//            });
//            element.bind('blur', function (e) {
//                if (scope.onBlur) {
//                    $timeout(function () {
//                        scope.onBlur();
//                    });
//                }
//            });
//            element.bind('keydown', function (e) {
//                if (e.which == 13) {
//                    if (scope.returnClose) element[0].blur();
//                    if (scope.onReturn) {
//                        $timeout(function () {
//                            scope.onReturn();
//                        });
//                    }
//                }
//            });
//        }
//    }
//})
.controller('PlaylistsCtrl', function ($scope, $stateParams, $ionicModal, $ionicSideMenuDelegate,$ionicModal, $state, $timeout, $compile) {
    var currentDate = new Date();
    $scope.date = date;

    $scope.openMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    }

    var date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 30);

    $scope.onezoneDatepicker = {
        date: date,
        mondayFirst: false,
        //months: ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"],
        //daysOfTheWeek: ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sa"],
        startDate: new Date(1989, 1, 26),
        endDate: new Date(2024, 1, 26),
        disablePastDays: false,
        disableSwipe: false,
        disableWeekend: false,
        //disableDates: [new Date(date.getFullYear(), date.getMonth(), 15), new Date(date.getFullYear(), date.getMonth(), 16), new Date(date.getFullYear(), date.getMonth(), 17)],
        showDatepicker: false,
        showTodayButton: true,
        calendarMode: false,
        hideCancelButton: false,
        hideSetButton: false,
        //callback: $scope.myFunction
    };

    $scope.onezoneDatepicker.showDatepicker = true;

    $ionicModal.fromTemplateUrl('templates/adddate.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.getStudent('calender');
        $scope.modal = modal;
    });

    $scope.sheduleToggle = function () {
        $scope.groups = studentDetails;
        $scope.calenderEvent = today;
        $scope.state = !$scope.state;
    };

    $scope.allowsheduleToggle = function () {
        $scope.scheduleform = !$scope.scheduleform;
    };

    $scope.inviteesToggle = function () {
        $scope.inviteesBox = !$scope.inviteesBox;
    };

    $scope.toggleGroup = function (group) {
        if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = group;
        }
    };

    $scope.isGroupShown = function (group) {
        return $scope.shownGroup === group;
    };

    $scope.selectAllChild = function ($event) {
        if ($event.currentTarget.checked) {
            angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".students")).prop("checked", true);
        }
        else
            angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".students")).prop("checked", false);
    }

    $scope.eventDetails = function (eventName) {
        //$scope.eventName = eventName;
        $state.go('app.eventdetails');
    }

    $scope.backtoCalander = function () {
        $state.go('app.calendar');
    }

    // A confirm dialog
    $scope.showConfirm = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Consume Ice Cream',
            template: 'Are you sure you want to eat this ice cream?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                console.log('You are sure');
            } else {
                console.log('You are not sure');
            }
        });
    };

    // An alert dialog
    $scope.showAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: 'Don\'t eat that!',
            template: 'It might taste good'
        });
        alertPopup.then(function (res) {
            console.log('Thank you for not eating my delicious ice cream cone');
        });
    };

}).controller('emailsCtrl', function ($scope, emailService, $http, $ionicModal, $sce, $compile) {
    $scope.data = {
        showDelete: false
    };
    $scope.onItemDelete = function (email) {
        $scope.emails.splice($scope.emails.indexOf(email), 1);
    };
    $(".loader").css({ "display": "block" });
    $scope.selected_emails = [];
    $scope.recipientType = "to";
    emails = [];
    $scope.loadEmails = function () {
        $http({
            method: 'POST',
            url: services.LoadEmails,
            data: { schoolId: localStorage.getItem("schoolId"), userId: localStorage.getItem("userId"), type: 0 },
        })
           .success(function (data) {
               angular.forEach(data.d.LoadEmailDetails_List, function (_a, _b) {
                   if (_a.ReciverId == localStorage.getItem("userId") && _a.ReciverDelete == 'N') {
                       var obj = {};
                       obj.id = _a.Id;
                       obj.subject = _a.Subject;
                       obj.date = _a.SentReciveMailDate;
                       obj.from = _a.SenderName;
                       obj.body = _a.Body;
                       obj.was_read = _a.ReadStatus == "Y" ? true : false;
                       emails.push(obj);
                   }
               });
               $scope.emails = emails;
               $(".loader").css({ "display": "none" });
               if (localStorage.getItem("isAdmin") == "true")
                   $("#composeMailClick").show();
               else
                   $("#composeMailClick").hide();
           })
           .error(function (response) {
               $(".loader").css({ "display": "none" });
           });
    }
    var selected_emails = [];
    $scope.viewEmail = function (id) {

        for (i = 0; i < emails.length; i++) {
            if (emails[i].id == id) {
                selected_emails = emails[i];
                $scope.selected_emails = emails[i];
                $(".loader").css({ "display": "block" });
                $http({
                    method: 'POST',
                    url: services.LoadSelectedEmailsForApp,
                    data: { schoolId: localStorage.getItem("schoolId"), userId: localStorage.getItem("userId"), type: 0, emailId: id },
                })
                    .success(function (data) {
                        angular.forEach(data.d.LoadEmailDetails_List, function (_a, _b) {
                            $scope.selected_emails.body = _a.Body;
                            $(".loader").css({ "display": "none" });
                        });
                    })
                    .error(function (data) {
                        $(".loader").css({ "display": "none" });
                    })
                return false;
            }
        }
    };

    $ionicModal.fromTemplateUrl('templates/mailView.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });


    $scope.trustAsHtml = function (string) {
        return $sce.trustAsHtml(string);
    };
    $ionicModal.fromTemplateUrl('templates/compose-mail.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.composeMail = modal;
    });

    $scope.toggleGroup = function (group) {
        if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = group;
        }
    };
    $scope.isGroupShown = function (group) {
        return $scope.shownGroup === group;
    };

    $scope.selectAllChild = function ($event) {
        if ($event.currentTarget.checked) {
            angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".students")).prop("checked", true);
        }
        else
            angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".students")).prop("checked", false);
    };
    $scope.student_Click = function (classN, $event) {
        var checkedSelectionLength = angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".sms_" + classN + ":checked")).length;
        var totalSelectionLength = angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".sms_" + classN)).length;
        if (checkedSelectionLength == totalSelectionLength)
            angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".parent_" + classN)).prop("checked", true);
        else
            angular.element($event.currentTarget.parentElement.parentElement.querySelectorAll(".parent_" + classN)).prop("checked", false);
    };


    function laodSchoolStudentsContacts() {
        var request = {};
        request.userId = localStorage.getItem("userId");
        request.schoolId = localStorage.getItem("schoolId");
        $.ajax({
            type: "POST",
            url: services.LaodContactEmailIds,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(request),
            dataType: "json",
            success: function (response) {
                var clsList = [], studentsList = [];
                students_List = response.d.StudentsMobileListData;
                angular.forEach(students_List, function (v, i) {
                    if (clsList.indexOf(v.SchoolName) == -1) {
                        clsList.push(v.SchoolName);
                    }
                });
                angular.forEach(clsList, function (c, ci) {
                    var obj = {};
                    obj["SchoolName"] = c;
                    obj["ClassName"] = c;
                    obj["ClassName_Style"] = replaceSpecialCharacters(c);
                    var data = [];
                    angular.forEach(students_List, function (v, i) {
                        if (c == v.SchoolName) {
                            var d = {};
                            d["StudentName"] = v.StudentName;
                            d["StudentID"] = v.StudentID;
                            d["MobNo"] = v.MobNo;
                            //$scope.msgCount = v.MsgCount;
                            //msgCount = v.MsgCount;
                            data.push(d);
                        }
                    });
                    obj["data"] = data;
                    studentsList.push(obj);
                });
                studentDetails = studentsList;
                $scope.groups = studentDetails;

                $ionicModal.fromTemplateUrl('templates/addEmailContacts.html', {
                    scope: $scope
                }).then(function (modal) {
                    $scope.addRecipients = modal;
                });

                //                     $ionicModal.fromTemplateUrl('templates/addrecipients.html', {
                //             scope: $scope
                //            }).then(function(modal) {
                //            try{
                //                document.getElementById("showMsgIcon").innerHTML = '<i class="ion-ios-speedometer-outline"></i>';
                //                }
                //                catch(ex){}
                //              $scope.mailContacts = modal;
                //            });
                //                customHtml = '<div class="addContacts" style="display:block !Important;">' +
                //            '<ion-list class="scroll">' +
                //            '<div class="row"><div class="col-90"><div class="h-title">Add Recipients</div></div><div class="col-10"><button class="button button-clear button-primary mm-btn" id="closeReceipts" onclick="$(\'.addContacts\').hide();$(\'.overlay\').hide()"><i class="ion-ios-close-empty"></i></button></div></div>' +
                //            '<div class="finalList"><div ng-repeat="group in groups">' +
                //              '<ion-item class="item-stable" ng-class="{active: isGroupShown(group)}" >' +
                //                  '<i class="icon pull-right" ng-class="isGroupShown(group) ? \'ion-minus\' : \'ion-plus\'" ng-click="toggleGroup(group)"></i>&nbsp;' +
                //                 '<input type="checkbox" class="parentsCheck h-check parent_{{group.ClassName_Style}}" title="{{group.SchoolName}}" ng-click="selectAllChild($event)">' +
                //                  '<span class="groupname"> {{group.SchoolName}}</span>' +
                //                      '</ion-item>' +
                //                      '<ion-item class="item-accordion" ng-repeat="item in group.data" ng-show="isGroupShown(group)">' +
                //                        '<input type="checkbox"  title="{{item.StudentName}}" ng-mob = "{{item.MobNo}}" ng-click="student_Click(group.ClassName_Style,$event)" ' +
                //                        'class="students sms_{{group.ClassName_Style}}" ' +
                //                        'id="{{item.StudentID}}"> {{item.MobNo}}' +
                //                      '</ion-item>'
                //                      + '</div></div>' +
                //                      '<div class="btn-footer">' +
                //                        '<button class="button btn-red  btn" ng-click="addEmailReceipt($event)">ADD</button>' +
                //                        '</div></ion-list>'
                //                $('body').append($compile(customHtml)($scope));
                //                $('.addContacts').hide();
                //                $(".overlay").hide();

            },
            error: function (response) {
                console.log(response);
            }
        });

    }

    laodSchoolStudentsContacts();

    /*add student details start*/
    $scope.addEmailReceipt = function ($event) {
        var student_Selection = "";
        var studentsSelections = "";
        var clasList = [];
        //receiptList = [];  //commented to handle cc and bcc
        angular.forEach(angular.element(document.querySelectorAll(".parentsCheck:checked")), function (data, value) {
            studentsSelections += angular.element(data).attr("title") + ',';
            var cl = angular.element(data).attr("title");
            clasList.push(angular.element(data).attr("title"))

            angular.forEach(angular.element(document.querySelectorAll(".sms_" + addDotWithClass(replaceSpecialCharacters(cl)) + ":checked")), function (data_S, value_S) {
                var obj = {};
                obj.StudentId = angular.element(data_S).attr("id");
                obj.MobNo = angular.element(data_S).attr("ng-mob");
                receiptList.push(obj);
            });
        });

        angular.forEach(angular.element(document.querySelectorAll(".parentsCheck")), function (data, value) {
            var cl = angular.element(data).attr("title");
            if (clasList.indexOf(cl) == -1) {
                angular.forEach(angular.element(document.querySelectorAll(".sms_" + addDotWithClass(replaceSpecialCharacters(cl)) + ":checked")), function (data_S, value_S) {
                    studentsSelections += angular.element(data_S).attr("title") + ',';
                    var obj = {};
                    obj.StudentId = angular.element(data_S).attr("id");
                    obj.MobNo = angular.element(data_S).attr("ng-mob");
                    receiptList.push(obj);
                });
            }
        });
        if (studentsSelections != "") {
            studentsSelections = studentsSelections.substr(0, studentsSelections.length - 1);
            angular.element(document.getElementById($scope.recipientType + "MailId")).val(studentsSelections);
        }
        else {
            alert("students selections are mandatory");
            $event.stopPropagation();
        }

        angular.element(document.getElementsByClassName("students")).prop("checked", false);
        angular.element(document.getElementsByClassName("parentsCheck")).prop("checked", false);
        $scope.addRecipients.hide();
    }
    /*add student details end*/

    $scope.sendEmail = function () {

        if (angular.element(document.getElementById("toMailId")).val().trim() == "") {
            alert("Please specify at least one recipient.");
            return false;
        }
        if (angular.element(document.getElementById("MailSubject")).val().trim() == "") {
            confirm("Meritmerge says\nSend this message without a subject or text in the body?");
            return false;
        }
        $(".loader").css({ "display": "block" });


        $http({
            method: 'POST',
            url: services.LoadEmails,
            data: { schoolId: localStorage.getItem("schoolId"), userId: localStorage.getItem("userId"), type: 0 },
        })
    .success(function (data) {
        if (data.d.LoadEmailDetails_List.length >= receiptList.length) {
            var emailIndex = 0;
            angular.forEach(receiptList, function (value, index) {
                var request = {};
                request.UserID = localStorage.getItem("userId");
                request.SchoolId = localStorage.getItem("schoolId");
                request.ReciverID = value.StudentId;
                request.Subject = $("#MailSubject").val();
                request.EmailText = $("#MailBody").val();
                var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                var date = new Date();
                date = date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear();
                request.SentDate = date;
                request.Attachment = 0;//localStorage.getItem("schoolId");            
                request.Important = 0;//localStorage.getItem("userId");
                request.ID = 0;
                $http({
                    method: 'POST',
                    url: services.AddUserEmailsForApp,
                    data: request
                })
                  .success(function (data) {
                      emailIndex++;
                      if (receiptList.length == emailIndex) {
                          alert("Mail has been sent successfully");
                          receiptList = [];
                          angular.element(document.getElementById("toMailId")).val("");
                          angular.element(document.getElementById("ccMailId")).val("");
                          angular.element(document.getElementById("bccMailId")).val("");
                          angular.element(document.getElementById("MailSubject")).val("");
                          angular.element(document.getElementById("MailBody")).val("");
                          angular.element(document.getElementsByClassName("students")).prop("checked", false);
                          angular.element(document.getElementsByClassName("parentsCheck")).prop("checked", false);
                          //$scope.getStudent("sms");
                          setTimeout(function () {
                              $(".loader").css({ "display": "none" });
                          })
                          $scope.composeMail.hide();
                      }
                  })
                  .error(function (response) {
                      $(".loader").css({ "display": "none" });
                  })
            });
        }
        else {
            alert("Please recharge your account");
            $(".loader").css({ "display": "none" });
        }
    })
            .error(function (data) {
                $(".loader").css({ "display": "none" });
            })
    }

    $scope.addEmailId = function ($event, type) {
        $(".overlay").remove();
        customHtml = '<div class="overlay"></div>';
        $("body").append($compile(customHtml)($scope));
        $(".overlay").show();
        $(".addContacts").show();
        receiptType = type;
    }
})
.factory('emailService', function ($http) {
    var emails = [];
    return {
        getEmails: function () {
            $http({
                method: 'POST',
                url: services.LoadEmails,
                data: { schoolId: localStorage.getItem("schoolId"), userId: localStorage.getItem("userId"), type: 0 },
            }).success(function (data) {
                angular.forEach(data.d.LoadEmailDetails_List, function (_a, _b) {
                    var obj = {};
                    obj.id = _a.Id;
                    obj.subject = _a.Subject;
                    obj.date = _a.SentReciveMailDate;
                    obj.from = _a.SenderName;
                    obj.body = _a.Body;
                    obj.was_read = _a.Body == "Y" ? true : false;
                    emails.push(obj);
                });
                $scope.emails = emails;
                return emails;
            })
             .error(function (response) {
             })
        },
        getEmail: function (id) {
            for (i = 0; i < emails.length; i++) {
                if (emails[i].id == id) {
                    return emails[i];
                }
            }
            return null;
        }
    }
});
/*all controls defined here end*/

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

/*reload events based on day selection from the calender start*/
function updateCalenderScope(selectedDate, flag) {
    try {
        //setTimeout(function(){        
        addColorsToDate();
        //})
        var scope = angular.element(document.querySelector('#calender_dtls')).scope();
        scope.eventsLists = [];
        if (flag)
            return false;

        selectedDate = selectedDate.setHours(0, 0, 0, 0);

        angular.forEach(calenderEventsList, function (v, i) {
            if (selectedDate >= new Date(v.FromDate) && selectedDate <= new Date(v.ToDate)) {
                scope.eventsLists.push(v);
            }
        });
    }
    catch (ex) { }
    if (localStorage.getItem("isAdmin") != "true")
        angular.element(document.getElementById("btnAddCalender")).css("display", "none");
}
/*reload events based on day selection from the calender end*/

function replaceSpecialCharacters(str) {
    return str.replace(/[^\w\s]/gi, '')
}

function addDotWithClass(str) {
    str = str.trim();
    return str.replace(/ /gi, '.')
}

function updateStudentCalendar(currentDate) {
    if (localStorage.getItem("isAdmin") == "false") {
        try {
            var scope = angular.element(document.querySelector('#calender_student_dtls')).scope();
            scope.getStudentCalendarDetails(currentDate.getMonth() + 1, currentDate.getFullYear());
        }
        catch (ex) {
        }
    }
}

function addImageToGallery() {
    $(".loader").css({ "display": "block" });
    var scope = angular.element(document.querySelector('#galleryThumbnails')).scope();
    var count = 0;
    if (document.getElementById("js_3").files.length == 0)
        $(".loader").css({ "display": "none" });
    for (var i = 0; i < document.getElementById("js_3").files.length; i++) {
        var formData = new FormData();
        var file = document.getElementById("js_3").files[i];
        formData.append("file" + i, file);
        formData.append("schoolid", localStorage.getItem("schoolId"));
        formData.append("galleryid", localStorage.getItem("GalleryId"));
        $.ajax(services.AddImageToGallery, {
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function (data, textStatus) {
                scope.getFolderImages(localStorage.getItem("GalleryId"));
                count++;
                if (count == document.getElementById("js_3").files.length && count == 1) {
                    alert("Image's has been uploaded successfully");
                    $(".loader").css({ "display": "none" });
                    hideMenuClick();
                }
                else if (count > 1 && count == document.getElementById("js_3").files.length) {
                    alert("Image's has been uploaded successfully");
                    $(".loader").css({ "display": "none" });
                    hideMenuClick();
                }
            },
            error: function (data) {
                $(".loader").css({ "display": "none" });
            }
        });
    }
}

/* Clear function Entry Start here */
function clearEntry() {
    $('#txtAlbumName').val('');
    $('#txtDescription').val('');
    $('#txtLocation').val('');
    location.reload();
}
/* Clear function Entry Start ends */

function saveClick() {
    if ($("#txtAlbumName").val() == "") {
        alert('Please enter the AlbumName');
        $('#btnokModel').click();
        $('#btnokModalOk').focus();
        //alert('Please enter the AlbumName'); $("#txtAlbumName").focus(); $('#pageloaddiv').hide();
    }
    else if ($("#txtDescription").val() == "") {
        alert('Please enter the Description');
        $('#btnokModel').click();
        $('#btnokModalOk').focus();
        //alert('Please enter the Description'); $("#txtDescription").focus(); $('#pageloaddiv').hide();
    }
    else if ($("#txtLocation").val() == "") {
        alert('Please enter the Location');
        $('#btnokModel').click();
        $('#btnokModalOk').focus();
        //alert('Please enter the Location'); $("#txtLocation").focus(); $('#pageloaddiv').hide();
    }
    else {
        //if (mode == 'S') {
        AddGalleryMasterSave();
        //}
        // else if (mode == 'M') {
        //    ClassMasterEdit();
        // }
    }

}

function closeClick() {
    if (confirm("Are you sure? Do you want to Close.")) {
        clearEntry();
    }
}

var downLoadGalleryImage = function ($event) {
    var downloadedImagePath = "";
    var _abc;
    $.each(angular.element($event.parentElement.parentElement).find("ion-slide"), function (_b, _a) {
        var _transElement = angular.element(_a).attr("style").split("transform:");
        if (_transElement.length > 1) {
            if (_transElement[1].trim() == "translate(0px, 0px) translateZ(0px);") {
                downloadedImagePath = angular.element(_a).find("img")[0].src
                _abc = _a;
            }
        }
    });
    if (downloadedImagePath != "") {
        window.open(downloadedImagePath);
    }
}

/*auto load messaging start*/
function autoLoadMessaging($http) {
    if (localStorage.getItem("userId") == null)
        return false;
    var request = {};
    request.userId = localStorage.getItem("userId");
    request.schoolId = localStorage.getItem("schoolId");
    request.isSchool = false;
    if (localStorage.getItem("isAdmin") == "true")
        request.isSchool = true;

    $http({
        method: 'POST',
        url: services.AutoLoadMessaging,
        data: { userId: request.userId, schoolId: request.schoolId, isSchool: request.isSchool },
    }).success(function (response) {
        $.each($(".groupDetails"), function (a, b) {
            $.each(response.d.GetMessagesCount, function (a1, b1) {
                if ($(b).attr("ng-isdefault-group") == "0" && b1.ReceivedType == 4 && b1.TypeId.toString() == $(b).attr("ng-classid")) {
                    if ($(b).find(".status").parent().find(".unreadCount").length == 0) {
                        $(b).find(".status").parent().append("<div class='unreadCount'>" + b1.UnReadCount + "</div>");
                    }
                    else if ($(b).find(".status").parent().find(".unreadCount").length > 0) {
                        if ($(b).find(".status").parent().find(".unreadCount").text() != b1.UnReadCount.toString()) {
                            $(b).find(".status").parent().find(".unreadCount").text(b1.UnReadCount);
                        }
                    }
                }
                if ($(b).attr("ng-isdefault-group") == "1" && b1.ReceivedType == 3 && b1.TypeId.toString() == $(b).attr("ng-classid")) {
                    if ($(b).find(".status").parent().find(".unreadCount").length == 0) {
                        $(b).find(".status").parent().append("<div class='unreadCount'>" + b1.UnReadCount + "</div>");
                    }
                    else if ($(b).find(".status").parent().find(".unreadCount").length > 0) {
                        if ($(b).find(".status").parent().find(".unreadCount").text() != b1.UnReadCount.toString()) {
                            $(b).find(".status").parent().find(".unreadCount").text(b1.UnReadCount);
                        }
                    }
                }
            });
        });
    }).error(function (data) {
        console.log("error in messaging");
    });
}
/*auto load messaging end*/

function loadCustomGroupDetails($http, $scope) {
    $http({
        method: 'POST',
        url: services.GetGroupDetailsForMessaging,
        data: { schoolId: localStorage.getItem("schoolId") },
    }).success(function (response) {
        studentsForCustomGroup = [], customGroupList = []
        studentsForCustomGroup = response.d.StudentsMessagingList_Data;
        $.each(studentsForCustomGroup, function (index, data) {
            var classIndex = customGroupList.map(function (e) { return e.ClassId; }).indexOf(data.ClassId)
            if (classIndex == -1)
                customGroupList.push({ ClassId: data.ClassId, ClassName: data.ClassName });
        });
        groupsBinding($scope);
    })
           .error(function (response) { })
}

/*groups binding start*/
function groupsBinding($scope) {
    $("#bindGroups").empty();
    var customHtml = "";
    if (localStorage.getItem("isAdmin") == "false") {
        $.each(parentsForMessaging, function (i, b) {
            if (b.ReceivedType == 2) {
                customHtml += '<div ng-classid="' + localStorage.getItem("schoolId") + '" title="' + localStorage.getItem("SchoolName") + '" class="row customRowStyles groupDetails parent_' + localStorage.getItem("schoolId") + ' checkDtlsDsgn" ng-isdefault-group = "-">';
                customHtml += '<div class="col-md-3">';
                customHtml += '<div class="class-group-image" for="../../img/ClassGroupIcon.png" style="background-image:url(../../Img/ClassGroupIcon.png)"> </div>';
                customHtml += '</div>';
                customHtml += '<div class="col-md-9">';
                customHtml += '<div class="status vCenter">' + localStorage.getItem("SchoolName") + '</div>';
                customHtml += '</div></div>';
                return false;
            }
        });
    }

    $.each(classList, function (clsIndex, clsData) {
        var bindStatus = false;
        if (localStorage.getItem("isAdmin") == "false") {
            $.each(parentsForMessaging, function (i, b) {
                if (b.ClassId == clsData.ClassId && b.ReceivedType == 3) {
                    bindStatus = true;
                    return false;
                }
            });
        }
        else {
            customHtml += '<div ng-classid="' + clsData.ClassId + '" title="' + clsData.ClassName + '" class="row customRowStyles groupDetails parent_' + clsData.ClassId + ' checkDtlsDsgn" ng-isdefault-group = "1">';
            customHtml += '<div class="leftAlign col-20">';
            customHtml += '<div class="class-group-image" for="../../Img/ClassGroupIcon.png">' + '<img src="https://www.littleconnect.in/images/Profile1.png"/></div>';
            customHtml += '</div>';
            customHtml += '<div class="rightAlign col-80">';
            customHtml += '<div class="status vCenter">' + clsData.ClassName + '</div>';
            customHtml += '</div></div>';
        }
        if (bindStatus) {
            customHtml += '<div ng-classid="' + clsData.ClassId + '" title="' + clsData.ClassName + '" class="row customRowStyles groupDetails parent_' + clsData.ClassId + ' checkDtlsDsgn" ng-isdefault-group = "1">';
            customHtml += '<div class="leftAlign col-20">';
            customHtml += '<div class="class-group-image" for="../../Img/ClassGroupIcon.png">' + '<img src="https://www.littleconnect.in/images/Profile1.png"/></div>';
            customHtml += '</div>';
            customHtml += '<div class="rightAlign col-80">';
            customHtml += '<div class="status vCenter">' + clsData.ClassName + '</div>';
            customHtml += '</div></div>';
        }
    });

    $.each(customGroupList, function (clsIndex, clsData) {
        var bindStatus = false;
        if (localStorage.getItem("isAdmin") == "false") {
            $.each(parentsForMessaging, function (i, b) {
                if (b.ClassId == clsData.ClassId && b.ReceivedType == 4) {
                    bindStatus = true;
                    return false;
                }
            });
        }
        else {
            customHtml += '<div ng-classid="' + clsData.ClassId + '" title="' + clsData.ClassName + '" class="row customRowStyles groupDetails parent_' + clsData.ClassId + ' checkDtlsDsgn" ng-isdefault-group = "0">';
            customHtml += '<div class="leftAlign col-20">';
            customHtml += '<div class="class-group-image" for="../../Img/ClassGroupIcon.png">' + '<img src="https://www.littleconnect.in/images/Profile1.png"/></div>';
            customHtml += '</div>';
            customHtml += '<div class="rightAlign col-80">';
            customHtml += '<div class="status vCenter">' + clsData.ClassName + '</div>';
            customHtml += '</div></div>';
        }
        if (bindStatus) {
            customHtml += '<div ng-classid="' + clsData.ClassId + '" title="' + clsData.ClassName + '" class="row customRowStyles groupDetails parent_' + clsData.ClassId + ' checkDtlsDsgn" ng-isdefault-group = "0">';
            customHtml += '<div class="leftAlign col-20">';
            customHtml += '<div class="class-group-image" for="../../Img/ClassGroupIcon.png">' + '<img src="https://www.littleconnect.in/images/Profile1.png"/></div>';
            customHtml += '</div>';
            customHtml += '<div class="rightAlign col-80">';
            customHtml += '<div class="status vCenter">' + clsData.ClassName + '</div>';
            customHtml += '</div></div>';
        }
    });

    $("#bindGroups").append(customHtml);

    $(".groupDetails").unbind().click(function () {
        $("#currentselections").text($(this).attr("title"));
        $(this).find(".status").parent().find(".unreadCount").remove();
        /*set group selection attributes start */
        var clsId = $(this).attr("ng-classid");
        var isDefaultGroup = $(this).attr("ng-isdefault-group");

        $("#view-Group-students").attr("ng-selected-group", clsId);
        $("#view-Group-students").attr("ng-isdefault-group", isDefaultGroup);
        $("#view-Group-students").attr("ng-isgroup", true);
        /*set group selection attributes end */
        $(".title.header-item").hide();
        $(".buttons.header-item").find(".title").css("display", "block");
        $("#selected-logo").attr("src", $(this).find(".class-group-image").attr("for"));
        $(".groupDetails").removeClass("groupSelected");
        $(this).addClass("groupSelected");
        $(".ms-empty-body").hide();
        $("#msg-content").empty();
        $scope.loadSelectedStudentMsgDetails(true);
        $("#txtMessaging").focus();
        $("#showRecentList,#contact-details").hide();
        $("#chatWindow").show();
        $(".title.title-left.header-item").text("Chat");
    });

    $('#pageloaddiv').hide();
}
/*groups binding end*/

$(document).ready(function () {
    $(".overlay").click(function (event) {
        event.stopPropagation()
    });
})

/*set color for calender start*/
function addColorsToDate() {
    angular.forEach($("li.pickadate-enabled"), function (_a, _b) {
        var calDay = new Date($(_a).attr("ng-date") + " 12:00:00 AM");
        angular.forEach(calenderEventsList, function (_c, _d) {
            if (calDay >= new Date(_c.From_Date) && calDay <= new Date(_c.To_Date)) {
                $(_a).css({ "backgroundColor": _c.Color });
            }
        });
    });
}
/*set color for calender end*/

function closeCustomPopup() {
    $(".overlay").hide();
    $(".showCustomPopup").hide();
    $(".modal-backdrop.active").css("pointer-events", "auto");
}
