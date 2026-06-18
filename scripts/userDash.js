/* =====================================================
   API CONFIGURATION & USER SESSION
   Stores API endpoints and retrieves the currently
   logged-in user session.
===================================================== */

const TRAINING_API = 'http://localhost:3000/training'
const EMP_API = 'http://localhost:3000/employee'
const loginSession = JSON.parse(localStorage.getItem('user'));
console.log(loginSession);
$('#nav-username').text(loginSession.name);

/* =====================================================
   USER PROFILE MANAGEMENT
   Fetches and displays logged-in employee details.
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
toastr.options = {
        "positionClass": "toast-bottom-right",
        "showDuration": "300",
        "preventDuplicates": true
      }

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
   FILTER MODAL INITIALIZATION
===================================================== */

const filterModal = new bootstrap.Modal(
    document.getElementById('filterModal')
)

function dateFormat(date){
  let newDate = new Date(date)
  newDate = newDate.toDateString().split(" ")
   return `${newDate[1]} ${newDate[2]},${newDate[3]}`

}

/* =====================================================
   TRAINING STATISTICS
   Calculates assigned, completed, started,
   and pending training counts.
===================================================== */

async function getCount(data){
    $("#courseCount").text(data.length)
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
    $('#compCount').text(completedCount);
    $('#startCount').text(startedCount);
    $('#notCount').text(notStartedCount);
 
}
getCount();

/* =====================================================
   SESSION MANAGEMENT
   Handles user logout operations.
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
   TRAINING CARD RENDERING
   Dynamically generates employee training cards.
===================================================== */

function renderElement(parent,data){
    let html = ``
  data.forEach(t => {
    html += `
    <div class="col-md-6">
  <div class="container border-orange rounded-4 p-3 train-card orange-gradient">

    <div class="d-flex justify-content-between align-items-start">

      <div class="flex-grow-1">

        <h5 class="mb-2">${t.courseName.length} Course${t.courseName.length > 1 ? 's' : ''}   <span class="ms-2 rounded-pill px-2  fs-6
          ${
            t.status === 'Not Started'
              ? 'bg-danger-subtle text-danger' 
              : t.status === 'Started'
              ? 'bg-info-subtle text-info'
              : 'bg-success-subtle text-success'
          }">
          ${t.status}
        </span></h5>

        <p class="mb-2 text-muted">
          ${t.courseName.join(', ')}
        </p>

        <div class="d-flex flex-wrap gap-3 mb-2">

          <small class="text-orange fw-bold">
            <span class="bi bi-clock me-1"></span>
            ${t.duration}
          </small>

          <small>
            <span class="bi bi-calendar-event me-1"></span>
            ${dateFormat(t.startDate)}
          </small>

          <small>
            <span class="bi bi-calendar-check me-1"></span>
            ${dateFormat(t.endDate)}
          </small>

        </div>

        

      </div>

      <div class="d-flex flex-column gap-2 ms-3">

        ${
          t.status === 'Not Started'
            ? `
            <span
              class="icon-tooltip bi bi-rocket  px-2 py-1 rounded-2 start-btn fs-4 cursor-pointer" data-tooltip="Start"
              onclick="startTraining('${t.id}')">
            </span>`
            : ''
        }

        ${
          t.status === 'Started'
            ? `
            <span
              class="icon-tooltip bi bi-check-circle-fill px-2 py-1 bg-success-subtle text-success border border-success-subtle border-2 rounded-2 fs-4 cursor-pointer"
              onclick="completeTraining('${t.id}')"
              data-tooltip="Complete">
            </span>`
            : ''
        }

        <span
          class="icon-tooltip bi bi-eye bg-info-subtle text-info border-info-subtle px-2 py-1 border border-2 rounded-2 fs-4 cursor-pointer"
          onclick="viewTraining('${t.id}')"
          data-bs-toggle="modal"
          data-bs-target="#viewModal"
          data-tooltip="View">
        </span>

      </div>

    </div>

  </div>
</div>
`;
    parent.innerHTML = html
  });
}

/* =====================================================
   TRAINING DATA RETRIEVAL
   Loads all active trainings assigned to the
   logged-in employee.
===================================================== */

async function getAllTrainingRecord() {
    const response = await fetch(`${TRAINING_API}?assignedEmployeeId=${loginSession.id}&isDeleted=false`)
    const data = await response.json();
    getCount(data);
    const trainParent = document.getElementById('training-parent')
  trainParent.replaceChildren();
  renderElement(trainParent,data.reverse())
    
}
getAllTrainingRecord();

/* =====================================================
   COMPLETED TRAINING RETRIEVAL
   Loads completed trainings assigned to the user.
===================================================== */

async function getCompletedTrainingRecord() {
    const response = await fetch(`${TRAINING_API}?assignedEmployeeId=${loginSession.id}&status=Completed&isDeleted=false`)
    const data = await response.json();
    const trainParent = document.getElementById('training-parent')
  trainParent.replaceChildren();
  renderElement(trainParent,data.reverse())
    
}

/* =====================================================
   TRAINING DETAILS VIEW
   Displays complete information for a selected
   training record.
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
   TRAINING STATUS MANAGEMENT
   Starts an assigned training.
===================================================== */

async function startTraining(id){
    const sweetResponse = await Swal.fire({
    title: 'Are you sure you want to start?',
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
    })
    if(sweetResponse.isConfirmed){
   const response = await fetch(`${TRAINING_API}/${id}`,{
    method:'PATCH',
    headers:{
        'Content-type':'application/json'
    },
    body:JSON.stringify({
        status:'Started'
    })
   });
   refreshTab(); 
    } 
   
}

/*******************************************************
 * TRAINING STATUS MANAGEMENT
 * Marks an ongoing training as completed.
*******************************************************/

async function completeTraining(id){
    const sweetResponse = await Swal.fire({
    title: 'Are you sure you want to complete?',
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
    })
    if(sweetResponse.isConfirmed){
   const response = await fetch(`${TRAINING_API}/${id}`,{
    method:'PATCH',
    headers:{
        'Content-type':'application/json'
    },
    body:JSON.stringify({
        status:'Completed'
    })
   });
   refreshTab(); 
    } 
   
}

/* =====================================================
   TRAINING TAB NAVIGATION
   Switches between All and Completed views.
===================================================== */

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

$('#filterApplyBtn').on('click',  () => {
   if($("#filterStatus").val()==" "&&!$("#filterStart").val()&&!$("#filterEnd").val()){
         toastr.warning('Atleat Appy One Filter!')
         return;
   }
     applyFilter();
    filterModal.hide();
$('#clrFilter').attr('disabled',false);
$('#allBtn').attr('disabled',true)
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
    $('#clrFilter').attr('disabled',true);
$('#allBtn').attr('disabled',false)
$('#completedBtn').attr('disabled',false)

})

/* =====================================================
   TRAINING FILTERING
   Retrieves training records matching filter criteria.
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
    params.append('assignedEmployeeId', loginSession.id);

    const response = await fetch(`${TRAINING_API}?${params}`);
    const data = await response.json();

    renderElement(document.getElementById('training-parent'), data);
}