/* =====================================================
   FORM VALIDATION PATTERNS
   Regular expressions used for validating user input.
===================================================== */
const emailRegex = /^[^\s@A-Z]+@[^\s@A-Z]+\.[^\s@A-Z]{2,}$/;
const nameRegex = /^[A-Za-z\s]{3,}$/;
const passRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).{8,15}$/
const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/

/* =====================================================
   FORM VALIDATION STATE
   Tracks signup and login validation status.
===================================================== */

let signupValid = false;
let loginValid = false;

/* =====================================================
   MODAL INITIALIZATION
   Bootstrap login and signup modals.
===================================================== */

const signupModal = new bootstrap.Modal(document.getElementById('signUpModal'))
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'))

const EMP_API = 'http://localhost:3000/employee'

const today = new Date();

/* =====================================================
   AGE RESTRICTION CONFIGURATION
   Restricts registration to users aged 18+
===================================================== */

today.setFullYear(today.getFullYear() - 18);

const maxDate = today.toISOString().split('T')[0];

$("#dob").attr("max", maxDate);

toastr.options = {
        "positionClass": "toast-bottom-right",
        "showDuration": "300",
        "preventDuplicates": true
      }

/* =====================================================
   VALIDATION HELPER FUNCTIONS
   Applies Bootstrap valid/invalid feedback styles.
===================================================== */

const addInValidClass = function (msg,eleID,msgID){
  $(msgID).text(msg)
   $(eleID).addClass('is-invalid')
          $(eleID).removeClass('is-valid')

          $(msgID).addClass('invalid-feedback');
          $(msgID).removeClass('valid-feedback');
} 

const addValidClass = function(msg,eleID,msgID){
   $(msgID).text(msg)
   $(eleID).addClass('is-valid')
       $(eleID).removeClass('is-invalid')
        $(msgID).addClass('valid-feedback');
          $(msgID).removeClass('invalid-feedback');
}

/* =====================================================
   SIGNUP FORM FIELD VALIDATIONS
   Real-time validation for registration fields.
===================================================== */

$('#email').on('input',function(){
  if(emailRegex.test($(this).val())){
     addValidClass('Valid Email','#email','#emailErrMsg');
     signupValid = true;
  }
  else{
    addInValidClass('Invalid Email','#email','#emailErrMsg');
    signupValid = false;
  }
})
$('#name').on('input',function(){
  if(nameRegex.test($(this).val())){
     addValidClass('Looks good!','#name','#nameErrMsg');
     signupValid = true;
  }
  else{
    addInValidClass('Invalid Name','#name','#nameErrMsg');
    signupValid = false;
  }
})
$('#pass').on('input',function(){
  if(passRegex.test($(this).val())){
     addValidClass('Valid password','#pass','#passErrMsg');
     signupValid = true;
  }
  else{
    addInValidClass('Invalid password. Password must be 8–15 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.  ','#pass','#passErrMsg');
    signupValid = false;
  }
  if($(this).val() == $('#cpass').val()){
     addValidClass('Password Matched','#cpass','#cpassErrMsg');
     signupValid = true;
  }
  else{
    addInValidClass('Password not matched','#cpass','#cpassErrMsg');
    signupValid = false;
  }
})
$('#cpass').on('input',function(){
  if($(this).val() == $('#pass').val()){
     addValidClass('Password Matched','#cpass','#cpassErrMsg');
     signupValid = true;
  }
  else{
    addInValidClass('Password not matched','#cpass','#cpassErrMsg');
    signupValid = false;
  }
})
$('#dob').on('input',function(){
  if(dateRegex.test($(this).val())){
     addValidClass('Password Matched','#dob','#cpassErrMsg');
     signupValid = true;
  }
  else{
    addInValidClass('Password not matched','#dob','#cpassErrMsg');
    signupValid = false;
  }
})



$('#logemail').on('input',function(){
  if(emailRegex.test($(this).val())){
     addValidClass('Valid Email','#logemail','#logEmailErrMsg');
     loginValid = true;
  }
  else{
    addInValidClass('Invalid Email','#logemail','#logEmailErrMsg');
    loginValid = false;
  }
})

/* =====================================================
   USER AUTHENTICATION
   Handles login verification, session creation,
   and role-based redirection.
===================================================== */

$('#login').on('click', async (e)=>{
    e.preventDefault();
    if($('#logemail').val()==""){
        toastr.warning('Empty Email field')
        loginValid = false;
    }
    else if($('#logpass').val()==""){
         toastr.warning('Empty Password field')
         loginValid = false;
    }
    else{
        loginValid = true
    }

    if(loginValid){
    const emailCheck = await fetch(`${EMP_API}?email=${$('#logemail').val()}`)
    const emailResponse = await emailCheck.json()
    if(emailResponse[0]?.email){
        const response = await fetch(`${EMP_API}?email=${$('#logemail').val()}&pass=${$('#logpass').val()}`)
        const data = await response.json();
        if(data[0]?.email){
            toastr.success('Login Success');
            document.getElementById('loginForm').reset();
        loginModal.hide()
       $('#logemail').removeClass('is-valid');
       console.log(data[0].role)
       localStorage.setItem('user',JSON.stringify({
        id:data[0].id,
        name: data[0].name,
        role:data[0].role
       }));
       console.log(localStorage.getItem('user'));
       setTimeout(()=>{
        if(data[0].role == 'admin'){
          window.location.replace('../pages/employeeDash.html')
        } 
        else{
          window.location.replace('../pages/userDash.html')
        }
       },1500);
        }
        else{
            toastr.error('Incorrect Password')
        }
    }
    else{
        toastr.error('User not available');
    }
    
    }
})

/* =====================================================
   USER REGISTRATION
   Validates form data and creates new employee
   accounts in the system.
===================================================== */

$('#signup').on('click',async (e)=>{
    e.preventDefault();
    console.log('clicked')

    if($('#name').val()==""){
     toastr.warning("Name field is empty")
     signupValid = false
  }
  else if($('#email').val()==""){
     toastr.warning("Email field is empty")
     signupValid = false
  }
  else if($('#pass').val()==""){
     toastr.warning("Password field is empty")
     signupValid = false
  }
  else if($('#cpass').val()==""){
     toastr.warning("Confirm password field is empty")
     signupValid = false
  }
  else if($('#dob').val()==""){
     toastr.warning("Confirm password field is empty")
     signupValid = false
  }
  else if(!$('#male').prop('checked')&&$('#female').prop('checked')){
    toastr.warning("Select the gender")
     signupValid = false
  }
  else if($('#desig').val() == ""){
    toastr.warning("Designation field empty")
     signupValid = false;
  }
  else{
    signupValid = true
  }
  if(signupValid){
    const emailCheck = await fetch(`${EMP_API}?email=${$('#email').val()}`)
    const emailResponse = await emailCheck.json(); 
    if(emailResponse[0]?.email){
        toastr.error('Email Already Exists')
    }
    else{
    const response = await fetch(`${EMP_API}`,{
        method:"POST",
        headers:{
            'Content-type':'application/json'
        },
        body:JSON.stringify({
            name: $('#name').val(),
            email: $('#email').val(),
            pass: $('#pass').val(),
            cpass: $('#cpass').val(),
            dob: $('#dob').val(),
            gender: $('#male').prop('checked')?"Male":"Female",
            department: $('#dept').val(),
            designation:$('#desig').val(),
            role: "employee"
        })
    })
    toastr.success('Registered Successfully')
    signupModal.hide();
    document.getElementById('signupForm').reset();
    $('#name').removeClass('is-valid');
    $('#email').removeClass('is-valid');
    $('#pass').removeClass('is-valid');
    $('#cpass').removeClass('is-valid');
    }
    
  }

})

