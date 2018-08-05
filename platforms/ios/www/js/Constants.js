var services = function () { };
//login
services.LoginService = "http://www.app.meritmerge.com/MMService.asmx/MMLogin";

//menu details
services.MenuService = "http://www.app.meritmerge.com/MMService.asmx/GetMenuItemsWithStaff";
//services.MenuService = "http://www.app.meritmerge.com/MMService.asmx/GetMenuItems";

//dashboard
services.DashService = "http://www.app.meritmerge.com/MMService.asmx/GetDashboard";

//calender
services.GetCalenderEventsService = "http://www.app.meritmerge.com/MMService.asmx/MMViewCalendarEvents";
services.GetStudent = "http://www.app.meritmerge.com/MMService.asmx/MMGetStudentsContacts";
services.AddCalenderEvents = "http://www.app.meritmerge.com/MMService.asmx/MMAddEventToCalendar";
services.GetStudentCalendar = "http://www.app.meritmerge.com/MMService.asmx/GetStudentCalendar";

//gallery
services.GetGalleryFolders = "http://www.app.meritmerge.com/MMService.asmx/GetGalleryMaster";
services.GetAlbumIamges = "http://www.app.meritmerge.com/MMService.asmx/GetAlbumIamges";
services.AddImageToGallery = "https://www.littleconnect.in/services/common/CommonServices.asmx/UploadImagesData";
services.AddAlbumToGallery = "http://www.app.meritmerge.com/MMService.asmx/GalleryCreation";

//sms
services.SendSMS = "http://www.app.meritmerge.com/MMService.asmx/SendSMS";
services.SMSCount = "http://www.app.meritmerge.com/MMService.asmx/GetCurrentSMSCount";
services.GetSMSTemplateForApp = "https://littleconnect.in/services/schools/sms.asmx/GetSMSTemplateForApp"
services.DeleteSMSTemplateForApp = "https://littleconnect.in/services/schools/sms.asmx/DeleteSMSTemplateForApp";
services.ADDSMSTemplateForApp = "https://littleconnect.in/services/schools/sms.asmx/ADDSMSTemplateForApp";
services.EditSMSTemplateForApp = "https://littleconnect.in/services/schools/sms.asmx/EditSMSTemplateForApp";

//mail
services.LoadEmails = "http://www.app.meritmerge.com/MMService.asmx/LoadEmailsForApp";
services.LoadSelectedEmailsForApp = "http://www.app.meritmerge.com/MMService.asmx/LoadSelectedEmailsForApp";
//services.LoadEmails = "http://www.app.meritmerge.com/MMService.asmx/LoadEmails";
services.LaodContactEmailIds = "https://www.littleconnect.in/Services/Schools/Email.asmx/LaodContactEmailIds"
services.AddUserEmailsForApp = "https://www.littleconnect.in/Services/Schools/Email.asmx/AddUserEmailsForApp"

//services.LoadEmails = "http://www.app.meritmerge.com/MMService.asmx/LoadEmails";
//services.LaodContactEmailIds = "https://www.littleconnect.in/Services/Schools/Email.asmx/LaodContactEmailIds"
//services.AddUserEmailsForApp = "https://www.littleconnect.in/Services/Schools/Email.asmx/AddUserEmailsForApp"

//attendance
services.ClassNamesForAttendance = "http://www.app.meritmerge.com/MMService.asmx/GetClassNamesAttendence";
services.StudentsForAttendance = "http://www.app.meritmerge.com/MMService.asmx/GetStudentsAttendence";
services.AddAttendance = "http://www.app.meritmerge.com/MMService.asmx/AddAttendence";

services.AddStudentEnquiry = "http://www.app.meritmerge.com/MMService.asmx/AddStudentEnquiry";
services.LoadInitialStudentEnquiry = "http://www.app.meritmerge.com/MMService.asmx/LoadInitialStudentEnquiry";
services.GenerateOTP = "http://www.app.meritmerge.com/MMService.asmx/GenerateOTP";
services.CheckOTP = "http://www.app.meritmerge.com/MMService.asmx/CheckOTP";

//messaging
services.GetStudnetsForMessaging = "http://www.app.meritmerge.com/Messaging/Messaging.asmx/GetStudnetsForMessaging";
services.SendMessaging = "http://www.app.meritmerge.com/Messaging/Messaging.asmx/SendMessaging";
services.AutoLoadMessaging = "http://www.app.meritmerge.com/Messaging/Messaging.asmx/AutoLoadMessaging";
services.GetIndividualMessaging = "http://www.app.meritmerge.com/Messaging/Messaging.asmx/GetIndividaulMessaging";
services.GetGroupDetailsForMessaging = "http://www.app.meritmerge.com/Messaging/Messaging.asmx/GetGroupDetailsForMessaging";

//fee management
services.LoadAllReceipts = "http://www.app.meritmerge.com/FeeManagement.asmx/FindClickEvent";
services.GetSelectedReceiptData = "http://www.app.meritmerge.com/FeeManagement.asmx/GetSelectedReceiptData";
services.GetStudentNamesForAdmissionEntrySearchApp = "https://littleconnect.in/services/FeesManagement/FeeHeadReceipt.asmx/GetStudentNamesForAdmissionEntrySearchApp";
services.AddEditHeadReceiptDataHead = "http://www.app.meritmerge.com/FeeManagement.asmx/AddEditHeadReceiptDataHead";
services.AddEditHeadReceiptDataDetail = "http://www.app.meritmerge.com/FeeManagement.asmx/AddEditHeadReceiptDataDetail";

//pupil register
services.AddStudentFromApp = "https://littleconnect.in/services/schools/sms.asmx/AddStudentFromApp";
services.GetStudentCreation_App = "https://littleconnect.in/Services/Schools/SMS.asmx/GetStudentCreation_App"

/*return current day start*/
function returnToday() {
    var getDate = new Date();
    var currentMonth = getDate.getMonth() + 1;
    if (currentMonth < 10)
        currentMonth = "0" + currentMonth;

    var currentDay = getDate.getDate();
    if (currentDay < 10)
        currentDay = "0" + currentDay;

    return getDate.getFullYear() + '-' + currentMonth + '-' + currentDay;
}
/*return current day end*/

