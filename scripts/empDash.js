const EMP_API = 'http://localhost:3000/employee'
const TRAINER_API = 'http://localhost:3000/trainer'
const COU_API = 'http://localhost:3000/course'
const TRAINING_API = 'http://localhost:3000/training'
const loginSession = JSON.parse(localStorage.getItem('user'));
console.log(loginSession);
$('#nav-username').text(loginSession.name);

toastr.options = {
        "positionClass": "toast-bottom-right",
        "showDuration": "300",
        "preventDuplicates": true
      }

const assignModal = new bootstrap.Modal(
    document.getElementById('assignModal')
)
const filterModal = new bootstrap.Modal(
    document.getElementById('filterModal')
)

function validateDate(date){
  const newDate = new Date(date);
  const today = new Date();
  today.setHours(0,0,0,0);

  return newDate>=today
}
function validateEndDate(end,start){
  const endDate = new Date(end);
  const startDate = new Date(start);
  startDate.setHours(0,0,0,0);
  endDate.setHours(0,0,0,0);

  return endDate>=startDate
}

function isDuplicateCourse(existingCourses, newCourse) {
    return existingCourses.some(
        course => course.toLowerCase().trim() === newCourse.toLowerCase().trim()
    )
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
     <option value="${emp.id}">
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

async function updateModal(id){
   const response = await fetch(`${TRAINING_API}?id=${id}`)
   const data = await response.json()
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
     <option value="${emp.name}">
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
   
   const today = new Date().toISOString().split('T')[0];
   $('#startDate').attr('min',today)
   $('#endDate').attr('min',today)
   

  

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
$('#updateSubmit').on('click',()=>{
 const courseNames = Array.from(
  document.getElementById("updateCourse").selectedOptions
).map(e => e.value)
console.log(courseNames);
})




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
else if($('#durationNum').val()==""){
    toastr.warning('Please enter a duration');
    assignValid = false;
}
else if(!validateDate($('#startDate').val())||!$('#startDate').val()){
   toastr.warning('Please enter a valid start date');
    assignValid = false;
}
else if(!validateEndDate($('#endDate').val(),$('#startDate').val())||!$('#endDate').val()){
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
const empId = $('#employee').val()
const courseCheck = await fetch(`${TRAINING_API}?assignedEmployeeId=${empId}`)

const courseCheckData = await courseCheck.json();
const existingCourse = courseCheckData[0].courseName;
console.log(existingCourse)
const hasDuplicate = courseNames.some(
    course => existingCourse.includes(course)
);
if(hasDuplicate){
    toastr.error('Course already assigned')
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
           duration : $('#durationNum').val()+" "+$('#duration').val(),
           startDate: $('#startDate').val(),
           endDate: $('#endDate').val(),
           assignedEmployeeId: $('#employee').val(),
           assignedEmployee: $('#employee').text().trim(),
           status:'Not Started'
        })
    })
    document.getElementById('assignModalForm').reset();
   assignModal.hide();
    toastr.success('Assigned Successfully')
    getAllTrainingRecord();
}
})

function renderElement(parent,data){
    let html = ``
  data.forEach(t => {
    html += `
     <div class="col-md-6 ">
      <div class="container border-orange rounded-4 d-flex justify-content-between ">
        <div class="d-flex flex-column">
         <p class="fs-5 my-2">${t.assignedEmployee}</p>
         <p class="my-1">Courses: ${t.courseName.join(',')}</p>
         <p class="my-1">Start Date: ${t.startDate}</p>
         <p class="my-1">End Date: ${t.endDate}</p>
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
                               <span class="bi bi-pen rounded-3 bg-warning-subtle text-warning border-warning-subtle fs-4 border border-3 px-2 py-1 cursor-pointer" data-bs-toggle="modal" data-bs-target="#updateModal" onclick="updateModal('${t.id}')"></span>
                               <span class="bi bi-trash rounded-3 bg-danger-subtle text-danger border-danger-subtle fs-4 border border-3 px-2 py-1 cursor-pointer"></span>
                               <span class="bi bi-eye rounded-3 bg-info-subtle text-info border-info-subtle fs-4 mt-auto mb-4 border border-3 px-2 py-1 cursor-pointer"></span>
                             
                      </div>
                      </div>
                    </div>
    
    ` 
    parent.innerHTML = html
  });
}

async function getAllTrainingRecord(){
  const response = await fetch(TRAINING_API)
  const data = await response.json();
  getStats(data);
   
  console.log(response,"inside")
  const trainParent = document.getElementById('train-parent')
  trainParent.replaceChildren();
  renderElement(trainParent,data)
}

getAllTrainingRecord();

async function getCompletedTrainingRecord(){
  const response = await fetch(`${TRAINING_API}?status=Completed`)
  const data = await response.json();
 
   
  console.log(response,"inside")
  const trainParent = document.getElementById('train-parent')
  trainParent.replaceChildren();
 renderElement(trainParent,data)
}

$('#filterApplyBtn').on('click',async ()=>{
    const status = $('#filterStatus').val();
    const start = $('#filterStart').val();
    const end = $('#filterEnd').val();
    const params = new URLSearchParams();

if(status){
    params.append('status',status);
}
if(start){
    params.append('startDate_gte',start);
}
if(end){
    params.append('endDate_lte',end);
}

const response = await fetch(
    `${TRAINING_API}?${params.toString()}`
);
const data = await response.json();
 const trainParent = document.getElementById('train-parent')
  trainParent.replaceChildren();
 renderElement(trainParent,data)
filterModal.hide();
$('#clrFilter').removeClass('d-none');
$('#allBtn').attr('disabled',true)
$('#completedBtn').attr('disabled',true)

})

$('#clrFilter').on('click',()=>{
    getAllTrainingRecord()
    $('#clrFilter').addClass('d-none');
$('#allBtn').attr('disabled',false)
$('#completedBtn').attr('disabled',false)
})

$('#completedBtn').on('click',function (){
    $('#allBtn').removeClass('btn-primary')
    $(this).addClass('btn-primary')
    getCompletedTrainingRecord();
})
$('#allBtn').on('click',function (){
    $('#completedBtn').removeClass('btn-primary')
    $(this).addClass('btn-primary')
    getAllTrainingRecord();
})



