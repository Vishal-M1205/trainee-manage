/* =====================================================
   API ENDPOINTS & SESSION MANAGEMENT
   Stores API URLs and retrieves logged-in user data.
===================================================== */

const EMP_API = 'http://localhost:3000/employee'
const TRAINER_API = 'http://localhost:3000/trainer'
const COU_API = 'http://localhost:3000/course'
const TRAINING_API = 'http://localhost:3000/training'
const loginSession = JSON.parse(localStorage.getItem('user'));
console.log(loginSession);
$('#nav-username').text(loginSession.name);

/* =====================================================
   DASHBOARD TAB STATE MANAGEMENT
   Controls All, Completed, and Filtered views.
===================================================== */

let allTab = true;
let compTab = false;
let filterTab = false;

function refreshTab() {
    if (allTab) {
        getAllTrainingRecord();
    } else if (compTab) {
        getCompletedTrainingRecord();
    } else if (filterTab) {
        applyFilter();
    }
}

/* =====================================================
   TOAST NOTIFICATION CONFIGURATION
===================================================== */

toastr.options = {
        "positionClass": "toast-bottom-right",
        "showDuration": "300",
        "preventDuplicates": true
      }

/* =====================================================
   BOOTSTRAP MODAL INITIALIZATION
   Assign, Filter, and Update Training modals.
===================================================== */

const assignModal = new bootstrap.Modal(
    document.getElementById('assignModal')
)
const filterModal = new bootstrap.Modal(
    document.getElementById('filterModal')
)
const updateModalDialog = new bootstrap.Modal(
    document.getElementById('updateModal')
)

//Changes the date format from digits to string
function dateFormat(date){
  let newDate = new Date(date)
  newDate = newDate.toDateString().split(" ")
   return `${newDate[1]} ${newDate[2]},${newDate[3]}`

}

//Used to get days between two dates
function getDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffInMs = end - start;
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
}


/* =====================================================
   USER SESSION & LOGOUT MANAGEMENT
===================================================== */

$('#logout').on('click',async ()=>{
    const response = await   Swal.fire({
    title: 'Are you sure you want to logout?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
    })
    if(response.isConfirmed){
            localStorage.removeItem('user');
             window.location.replace('../pages/index.html')
    }
})


/* =====================================================
   DASHBOARD STATISTICS
   Fetches employee, trainer, and course counts.
===================================================== */
async function getCount(){
    const empResp = await fetch(`${EMP_API}?role=employee`,{
        method:'GET'
    })
    const empCount = await empResp.json();
    $('#empCount').text(empCount.length)
    const trainResp = await fetch(TRAINER_API,{
        method:'GET'
    })
    const trainCount = await trainResp.json();
    $('#trainCount').text(trainCount.length)
    const courseResp = await fetch(COU_API,{
        method:'GET'
    })
    const courseCount = await courseResp.json();
    $('#courseCount').text(courseCount.length)
}
getCount();

/* =====================================================
   TRAINING ANALYTICS
   Calculates training status counts and progress bars.
===================================================== */
async function getStats(data) {
    $('#totalAssign').text(data.length)
    let completedCount = 0;
    let startedCount = 0;
    let notStartedCount = 0;
    data.forEach(t=>{
        if(t.status=="Not Started"){
            notStartedCount++
        }
        else if(t.status=="Started"){
            startedCount++;
        }
        else if(t.status=="Completed"){
            completedCount++
        }
    })
    $('#completed').text(completedCount);
    $('#started').text(startedCount);
    $('#notstarted').text(notStartedCount);
    $('#compBar').css('width',`${Math.floor((completedCount*100/data.length))}%`)
    $('#startBar').css('width',`${Math.floor((startedCount*100/data.length))}%`)
    $('#notBar').css('width',`${Math.floor((notStartedCount*100/data.length))}%`)
    

}

/* =====================================================
   TRAINING ASSIGNMENT MODAL
   Loads courses, trainers, employees, and initializes
   Choices.js multi-select components.
===================================================== */
$('#assignModalBtn').on(('click'),async ()=>{
   const courseResponse = await fetch(COU_API);
   const courseData = await courseResponse.json()
   console.log(courseData);
   const select = document.getElementById('course');
   courseData.forEach((course)=>{
    select.innerHTML += `
     <option value="${course.courseName}" data-id="${course.courseId}"">
          ${course.courseName}
        </option>
    `
   })

  const trainResponse = await fetch(TRAINER_API);
   const trainData = await trainResponse.json()
   console.log(trainData);
   const trainSelect = document.getElementById('trainer');
   trainData.forEach((trainer)=>{
    trainSelect.innerHTML += `
     <option value="${trainer.trainerName}">
          ${trainer.trainerName}
        </option>
    `
   })
  const empResponse = await fetch(`${EMP_API}?role=employee`);
   const empData = await empResponse.json()
   console.log(empData);
   const empSelect = document.getElementById('employee');
   empData.forEach((emp)=>{
    empSelect.innerHTML += `
     <option value="${emp.name}" data-empid="${emp.id}">
          ${emp.name}
        </option>
    `
   })

   new Choices('#course',{
    removeItemButton:true
   })
   new Choices('#trainer',{
    removeItemButton:true
   })
   const today = new Date().toISOString().split('T')[0];
   $('#startDate').attr('min',today)
   $('#endDate').attr('min',today)
})

/* =====================================================
   TRAINING UPDATE OPERATIONS
   Loads existing training data and updates records.
===================================================== */
async function updateModal(id){
   const response = await fetch(`${TRAINING_API}?id=${id}`)
   const data = await response.json()
   console.log(data,"update data")
   const courseResponse = await fetch(COU_API);
   const courseData = await courseResponse.json()
   console.log(courseData);
   const select = document.getElementById('updateCourse');
   courseData.forEach((course)=>{
    select.innerHTML += `
     <option value="${course.courseName}">
          ${course.courseName}
        </option>
    `
   })

  const trainResponse = await fetch(TRAINER_API);
   const trainData = await trainResponse.json()
   console.log(trainData);
   const trainSelect = document.getElementById('updateTrainer');
   trainData.forEach((trainer)=>{
    trainSelect.innerHTML += `
     <option value="${trainer.trainerName}">
          ${trainer.trainerName}
        </option>
    `
   })
  const empResponse = await fetch(`${EMP_API}?role=employee`);
   const empData = await empResponse.json()
   console.log(empData);
   const empSelect = document.getElementById('updateEmployee');
   empData.forEach((emp)=>{
    empSelect.innerHTML += `
     <option value="${emp.name}" data-empid="${emp.id}">
          ${emp.name}
        </option>
    `
   })

   const currentCourse = new Choices('#updateCourse',{
    removeItemButton:true
   })
   currentCourse.setChoiceByValue(data[0].courseName);

 
   const currentTrainer = new Choices('#updateTrainer',{
    removeItemButton:true
   })
   currentTrainer.setChoiceByValue(data[0].trainerName);
   
   $('#updateEmployee').val(data[0].assignedEmployee)

   $('#updateCtype').val(data[0].courseType)

   $('#updateStartDate').val(data[0].startDate);
   $('#updateEndDate').val(data[0].endDate);
   
   
   $('#updateStartDate').attr('min',$('#updateStartDate').val())
   $('#updateEndDate').attr('min',$('#updateStartDate').val())
   
   $('#updateSubmit').on('click',async ()=>{
const course = document.getElementById('updateCourse');
    const trainer = document.getElementById('updateTrainer');
 let updateValid = true;
if (course.selectedOptions.length === 0) {
    toastr.warning('Please select at least one course');
    updateValid = false;
}
else if (trainer.selectedOptions.length === 0) {
    toastr.warning('Please select at least one trainer');
    updateValid = false;
}
else if(!$('#updateStartDate').val()){
   toastr.warning('Please enter a valid start date');
    updateValid = false;
}
else if(!$('#updateEndDate').val()){
   toastr.warning('Please enter a valid end date');
    updateValid = false;
}

if(updateValid){
   
const courseNames = Array.from(
  document.getElementById("updateCourse").selectedOptions
).map(e => e.value)
 const trainerNames = Array.from(
  document.getElementById("updateTrainer").selectedOptions
).map(e => e.value)

const empId = $('#updateEmployee option:selected').attr('data-empid');

const courseCheck = await fetch(
    `${TRAINING_API}?assignedEmployeeId=${empId}&isDeleted=false`
);

const courseCheckData = await courseCheck.json();

let assignedCourses = [];

courseCheckData.forEach(training => {
    if (training.id !== id) {
        assignedCourses.push(...training.courseName);
    }
});

const duplicateCourses = courseNames.filter(course =>
    assignedCourses.includes(course)
);

if (duplicateCourses.length > 0) {
    toastr.error(
        `Course already assigned: ${duplicateCourses.join(', ')}`
    );
    return;
}

const response = await  Swal.fire({
    title: 'Are you sure you want to update?',
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
    })
    if(response.isConfirmed){
        console.log(id)
    const updateResponse = await fetch(`${TRAINING_API}/${id}`,{
        method:"PATCH",
        headers:{
            'Content-type':'application/json'
        },
        body:JSON.stringify({
            courseName: courseNames,
            trainerName:trainerNames,
           assignedEmployeeId:$('#updateEmployee option:selected').attr('data-empid'),
           assignedEmployee:$('#updateEmployee').val(),
           courseType: $('#updateCtype').val(),
           startDate:$('#updateStartDate').val(),
           endDate:$('#updateEndDate').val(),
           duration:  getDaysBetween($('#updateStartDate').val(), $('#updateEndDate').val())+" Day"
        })
    })
    toastr.success('Updated Successfully')
     updateModalDialog.hide(); 
     refreshTab();
    }



}


})

   /* =====================================================
   CHOICES.JS SELECT INPUT CLEAR FUNCTION
  .destroy() and .removeActiveItems() are used to clear the 
  selected elements
===================================================== */

   $('#updateModal').on('hidden.bs.modal', function () {
     currentCourse.removeActiveItems();
    currentTrainer.removeActiveItems();
    $('#updateCourse').empty();
    $('#updateTrainer').empty();
    $('#updateEmployee').empty();
    currentCourse.destroy();
    currentTrainer.destroy();
});

}


/* =====================================================
   NEW TRAINING ASSIGNMENT
   Validates and assigns training to employees.
===================================================== */


$('#assignSubmit').on('click',async (e)=>{
    e.preventDefault();
    const course = document.getElementById('course');
    const trainer = document.getElementById('trainer');
 let assignValid = true;
if (course.selectedOptions.length === 0) {
    toastr.warning('Please select at least one course');
    assignValid = false;
}

else if (trainer.selectedOptions.length === 0) {
    toastr.warning('Please select at least one trainer');
    assignValid = false;
}
// else if($('#durationNum').val()==""){
//     toastr.warning('Please enter a duration');
//     assignValid = false;
// }
else if(!$('#startDate').val()){
   toastr.warning('Please enter a valid start date');
    assignValid = false;
}
else if(!$('#endDate').val()){
   toastr.warning('Please enter a valid end date');
    assignValid = false;
}


if(assignValid){
    const courseNames = Array.from(
  document.getElementById("course").selectedOptions
).map(e => e.value)
    const trainerNames = Array.from(
  document.getElementById("trainer").selectedOptions
).map(e => e.value)
const empId = $('#employee option:selected').attr('data-empid');

const courseCheck = await fetch(
    `${TRAINING_API}?assignedEmployeeId=${empId}&isDeleted=false`
);

const courseCheckData = await courseCheck.json();

let assignedCourses = [];

if (courseCheckData && courseCheckData.length > 0) {
    courseCheckData.forEach(training => {
        assignedCourses.push(...training.courseName);
    });
}

const duplicateCourses = courseNames.filter(course =>
    assignedCourses.includes(course)
);

if (duplicateCourses.length > 0) {
    toastr.error(
        `Course already assigned: ${duplicateCourses.join(', ')}`
    );
    return;
}



    const trainingResponse = await fetch(TRAINING_API,{
        method:"POST",
        headers:{
            'Content-type':'applicaation/json'
        },
        body: JSON.stringify({
            courseName: courseNames,
            courseType : $('#ctype').val(),
           trainerName : trainerNames,
           duration : getDaysBetween($('#startDate').val(), $('#endDate').val())+" Day",
           startDate: $('#startDate').val(),
           endDate: $('#endDate').val(),
           assignedEmployeeId: $('#employee option:selected').attr('data-empid'),
           assignedEmployee: $('#employee').val(),
           status:'Not Started',
           isDeleted:false
        })
    })
    document.getElementById('assignModalForm').reset();
   assignModal.hide();
    toastr.success('Assigned Successfully')
    getAllTrainingRecord();
}
})

/* =====================================================
   TRAINING DETAILS VIEW
   Displays complete training information.
===================================================== */

async function viewTraining(id) {
    const response = await fetch(`${TRAINING_API}/${id}`);
    const data = await response.json();

    $('#viewEmployee').text(data.assignedEmployee);
    $('#viewStatus').text(data.status);
    $('#viewCourses').text(data.courseName.join(', '));
    $('#viewCourseType').text(data.courseType);
    $('#viewTrainers').text(data.trainerName.join(', '));
    $('#viewDuration').text(data.duration);
    $('#viewStartDate').text(dateFormat(data.startDate));
    $('#viewEndDate').text(dateFormat(data.endDate));

    const statusEl = document.getElementById('viewStatus');

    statusEl.className = '';

    if (data.status === 'Not Started') {
        statusEl.classList.add('badge', 'bg-danger');
    }
    else if (data.status === 'Started') {
        statusEl.classList.add('badge', 'bg-info');
    }
    else {
        statusEl.classList.add('badge', 'bg-success');
    }
}

/* =====================================================
   SOFT DELETE OPERATIONS
   Marks training records as deleted.
===================================================== */

async function deleteTraining(id){
  const response = await  Swal.fire({
    title: 'Are you sure you want to delete?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
    })  
 if(response.isConfirmed){
    const deleteResponse = await fetch(`${TRAINING_API}/${id}`,{
        method:"PATCH",
        headers:{
            'Content-type':'application/json'
        },
        body:JSON.stringify({
            isDeleted:true
        })
    })
    toastr.warning('Deleted Succssfully');
    refreshTab();
 }
}

/* =====================================================
   TRAINING CARD RENDERING
   Dynamically generates training cards.
===================================================== */

function renderElement(parent,data){
    let html = ``
  data.forEach(t => {
    html += `
     <div class="col-md-6 ">
      <div class="container border-orange orange-gradient rounded-4 d-flex justify-content-between train-card">
        <div class="d-flex flex-column">
         <p class="fs-5 my-2">${t.assignedEmployee}</p>
         <p class="my-1">Courses: ${t.courseName.join(',')}</p>
         <p class="my-1">Start Date: ${dateFormat(t.startDate)}</p>
         <p class="my-1">End Date: ${dateFormat(t.endDate)}</p>
        <p class="px-2 py-2 rounded-pill text-center text-nowrap w-fit
${t.status === 'Not Started'
    ? 'bg-danger-subtle text-danger'
    : t.status === 'Started'
    ? 'bg-info-subtle text-info'
    : 'bg-success-subtle text-success'}">
    ${t.status}
</p>
       </div>
                      <div class="d-flex flex-column mt-3 align-items-center justify-content-start gap-3">
                               <span class="bi bi-pen rounded-3 bg-warning-subtle text-warning border-warning-subtle fs-4 border border-3 px-2 py-1 cursor-pointer icon-tooltip" data-bs-toggle="modal" data-bs-target="#updateModal" onclick="updateModal('${t.id}')"
                               data-tooltip="Edit"></span>
                               <span class="bi bi-trash rounded-3 bg-danger-subtle text-danger border-danger-subtle fs-4 border border-3 px-2 py-1 cursor-pointer icon-tooltip" onclick="deleteTraining('${t.id}')"
                               data-tooltip="Delete"></span>
                               <span class="bi bi-eye rounded-3 bg-info-subtle text-info border-info-subtle fs-4 mt-auto mb-4 border border-3 px-2 py-1 cursor-pointer icon-tooltip" onclick="viewTraining('${t.id}')" data-bs-toggle="modal" data-bs-target="#viewModal" data-tooltip="View"></span>
                             
                      </div>
                      </div>
                    </div>
    
    ` 
    parent.innerHTML = html
  });
}

/* =====================================================
   TRAINING DATA RETRIEVAL
   Fetches all active training records.
===================================================== */

async function getAllTrainingRecord(){
  const response = await fetch(`${TRAINING_API}?isDeleted=false`)
  const data = await response.json();
  getStats(data);
  
  
  const trainParent = document.getElementById('train-parent')
  trainParent.replaceChildren();
  renderElement(trainParent,data.reverse())
}

getAllTrainingRecord();

/* =====================================================
   COMPLETED TRAINING RETRIEVAL
===================================================== */

async function getCompletedTrainingRecord(){
  const response = await fetch(`${TRAINING_API}?status=Completed&isDeleted=false`)
  const data = await response.json();
 
   
  console.log(response,"inside")
  const trainParent = document.getElementById('train-parent')
  trainParent.replaceChildren();
 renderElement(trainParent,data.reverse())
}

/* =====================================================
   TRAINING FILTERING
   Filters records by status and date range.
===================================================== */

async function applyFilter() {
    const status = $('#filterStatus').val();
    const start = $('#filterStart').val();
    const end = $('#filterEnd').val();

    const params = new URLSearchParams();

    if(status!== " "){
     if(status) params.append('status', status);
   }
    if(start) params.append('startDate_gte', start);
    if(end) params.append('endDate_lte', end);

    params.append('isDeleted', false);

    const response = await fetch(`${TRAINING_API}?${params}`);
    const data = await response.json();

    renderElement(document.getElementById('train-parent'), data);
}


/* =====================================================
   FILTER ACTIONS
   Apply and clear filter operations.
===================================================== */

$('#filterApplyBtn').on('click',  () => {
      if($("#filterStatus").val()==" "&&!$("#filterStart").val()&&!$("#filterEnd").val()){
         toastr.warning('Atleat Appy One Filter!')
         return;
   }
     applyFilter();
    filterModal.hide();
$('#clrFilter').removeClass('d-none');
$('#allBtn').attr('disabled',true)

/* =====================================================
   TRAINING TAB NAVIGATION
   Switches between All and Completed training views.
===================================================== */

$('#completedBtn').attr('disabled',true)
    allTab = false;
    compTab = false;
    filterTab = true;
});
$('#clrFilter').on('click',()=>{
    allTab =true
compTab=false
filterTab = false
refreshTab()
    $('#clrFilter').addClass('d-none');
$('#allBtn').attr('disabled',false)
$('#completedBtn').attr('disabled',false)

})

$('#completedBtn').on('click',function (){
    $('#allBtn').removeClass('btn-orange-gradinet')
    $(this).addClass('btn-orange-gradinet')
allTab =false
compTab=true
filterTab = false
refreshTab()
})
$('#allBtn').on('click',function (){
    $('#completedBtn').removeClass('btn-orange-gradinet')
    $(this).addClass('btn-orange-gradinet')
    allTab =true
compTab=false
filterTab = false
refreshTab()
})

/* =====================================================
   PERMANENT DELETE OPERATIONS
   Removes training records permanently.
===================================================== */

async function deleteTrainingPermanent(id) {
     const response = await  Swal.fire({
    title: 'Are you sure you want to delete permanently?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
    })  
 if(response.isConfirmed){
    const deleteResponse = await fetch(`${TRAINING_API}/${id}`,{
        method:"DELETE"
    })
    toastr.warning('Deleted Succssfully');
    $('#histBtn').trigger('click');
    refreshTab();
 }
}

/* =====================================================
   TRAINING HISTORY MANAGEMENT
   Displays and manages soft-deleted records.
===================================================== */

$("#histBtn").on('click', async () => {
    const response = await fetch(`${TRAINING_API}?isDeleted=true`);
    const data = await response.json();

    const parent = document.getElementById('historyParent');

    let html = '';

    data.forEach(t => {
        html += `
            <div class="col-md-6">
                <div class="border rounded-4 p-3">
                    <h6>${t.assignedEmployee}</h6>
                    <p class="mb-2">
                        ${t.courseName.join(', ')}
                    </p>
                    <div class="d-flex gap-2">
                        <span
                            class="bi bi-eye-fill fs-4 text-info cursor-pointer"
                            onclick="viewTraining('${t.id}')"
                            data-bs-toggle="modal"
                            data-bs-target="#viewModal">
                        </span>
                        <span
                            class="bi bi-arrow-counterclockwise fs-4 text-success cursor-pointer"
                            onclick="restoreTraining('${t.id}')">
                        </span>
                        <span
                            class="bi bi-trash fs-4 text-danger cursor-pointer"
                            onclick="deleteTrainingPermanent('${t.id}')">
                        </span>
                    </div>
                </div>
            </div>
        `;
    }); 
    parent.innerHTML = html;
});

/* =====================================================
   TRAINING RESTORATION
   Restores previously deleted training records.
===================================================== */

async function restoreTraining(id) {

     const sweetResponse = await   Swal.fire({
    title: 'Are you sure you want to restore?',
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
    })
    if(sweetResponse.isConfirmed){
        const response = await fetch(`${TRAINING_API}/${id}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isDeleted: false
            })
        }
    );

        toastr.success('Training Restored');
        $('#histBtn').trigger('click');
        refreshTab();
    }

    
}

/* =====================================================
   USER PROFILE MANAGEMENT
   Loads logged-in administrator profile details.
===================================================== */

async function getUserDetails() {
  const response = await fetch(`${EMP_API}/${loginSession.id}`)
  const data = await response.json()
  $("#userName").text(data.name);
        $("#userId").text(data.id);
        $("#userEmail").text(data.email);
        $("#userGender").text(data.gender);
        $("#userDob").text(dateFormat(data.dob));
        $("#userDepartment").text(data.department);
        $("#userDesignation").text(data.designation);
        $("#userRole").text(data.role);
        $("#userRoleText").text(data.role);
 
}
getUserDetails();


