const TRAINING_API = 'http://localhost:3000/training'
const loginSession = JSON.parse(localStorage.getItem('user'));
console.log(loginSession);
$('#nav-username').text(loginSession.name);

toastr.options = {
        "positionClass": "toast-bottom-right",
        "showDuration": "300",
        "preventDuplicates": true
      }
let allTab = true;
let compTab = false;
let filterTab = false;

const filterModal = new bootstrap.Modal(
    document.getElementById('filterModal')
)

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

function refreshTab() {
    if (allTab) {
        getAllTrainingRecord();
    } else if (compTab) {
        getCompletedTrainingRecord();
    } else if (filterTab) {
        applyFilter();
    }
}

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

function renderElement(parent,data){
    let html = ``
  data.forEach(t => {
    html += `
    <div class="col-md-6">
  <div class="container border-orange rounded-4 p-3">

    <div class="d-flex justify-content-between align-items-start">

      <div class="flex-grow-1">

        <h5 class="mb-2">${t.courseName.length} Course${t.courseName.length > 1 ? 's' : ''}   <span class="ms-2   badge
          ${
            t.status === 'Not Started'
              ? 'bg-danger'
              : t.status === 'Started'
              ? 'bg-info'
              : 'bg-success'
          }">
          ${t.status}
        </span></h5>

        <p class="mb-2 text-muted">
          ${t.courseName.join(', ')}
        </p>

        <div class="d-flex flex-wrap gap-3 mb-2">

          <small>
            <span class="bi bi-clock me-1"></span>
            ${t.duration}
          </small>

          <small>
            <span class="bi bi-calendar-event me-1"></span>
            ${t.startDate}
          </small>

          <small>
            <span class="bi bi-calendar-check me-1"></span>
            ${t.endDate}
          </small>

        </div>

        

      </div>

      <div class="d-flex flex-column gap-2 ms-3">

        ${
          t.status === 'Not Started'
            ? `
            <span
              class="bi bi-play-fill fs-4 cursor-pointer"
              onclick="startTraining('${t.id}')">
            </span>`
            : ''
        }

        ${
          t.status === 'Started'
            ? `
            <span
              class="bi bi-check-circle-fill fs-4 cursor-pointer"
              onclick="completeTraining('${t.id}')">
            </span>`
            : ''
        }

        <span
          class="bi bi-eye fs-4 cursor-pointer"
          onclick="viewTraining('${t.id}')"
          data-bs-toggle="modal"
          data-bs-target="#viewModal">
        </span>

      </div>

    </div>

  </div>
</div>
`;
    parent.innerHTML = html
  });
}

async function getAllTrainingRecord() {
    const response = await fetch(`${TRAINING_API}?assignedEmployeeId=${loginSession.id}`)
    const data = await response.json();
    getCount(data);
    const trainParent = document.getElementById('training-parent')
  trainParent.replaceChildren();
  renderElement(trainParent,data)
    
}
getAllTrainingRecord();
async function getCompletedTrainingRecord() {
    const response = await fetch(`${TRAINING_API}?assignedEmployeeId=${loginSession.id}&status=Completed`)
    const data = await response.json();
    const trainParent = document.getElementById('training-parent')
  trainParent.replaceChildren();
  renderElement(trainParent,data)
    
}



async function viewTraining(id) {
    const response = await fetch(`${TRAINING_API}/${id}`);
    const data = await response.json();

    $('#viewEmployee').text(data.assignedEmployee);
    $('#viewStatus').text(data.status);
    $('#viewCourses').text(data.courseName.join(', '));
    $('#viewCourseType').text(data.courseType);
    $('#viewTrainers').text(data.trainerName.join(', '));
    $('#viewDuration').text(data.duration);
    $('#viewStartDate').text(data.startDate);
    $('#viewEndDate').text(data.endDate);

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

$('#completedBtn').on('click',function (){
    $('#allBtn').removeClass('btn-primary')
    $(this).addClass('btn-primary')
allTab =false
compTab=true
filterTab = false
refreshTab()
})

$('#allBtn').on('click',function (){
    $('#completedBtn').removeClass('btn-primary')
    $(this).addClass('btn-primary')
    allTab =true
compTab=false
filterTab = false
refreshTab()
})

$('#filterApplyBtn').on('click', async () => {
    await applyFilter();
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

async function applyFilter() {
    const status = $('#filterStatus').val();
    const start = $('#filterStart').val();
    const end = $('#filterEnd').val();

    const params = new URLSearchParams();

    if(status) params.append('status', status);
    if(start) params.append('startDate_gte', start);
    if(end) params.append('endDate_lte', end);

    params.append('isDeleted', false);
    params.append('assignedEmployeeId', loginSession.id);

    const response = await fetch(`${TRAINING_API}?${params}`);
    const data = await response.json();

    renderElement(document.getElementById('training-parent'), data);
}