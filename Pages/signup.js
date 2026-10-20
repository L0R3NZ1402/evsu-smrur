import {
    Utils,
    Select
} from "../Utilities/util.js";


export function init() {

    Select('#signupBtn').addEventListener("click", () => {
        // console.log("Signup button clicked");
        const firstName = Select('#first-name').value;
        const lastName = Select('#last-name').value;
        const department = Select('#department').value;
        const username = Select('#username').value;
        const password = Select('#password').value;
        const confirmPassword = Select('#confirm-password').value;

        if (!firstName || !lastName || !department || !username || !password || !confirmPassword) {
            Utils.Alert({
                alert: 'warning',
                title: 'Oops, missing some details',
                message: 'It looks like a few required fields are still empty. Please add the missing details so we can get this item listed right away.',
            })
            return;
        }

        if (password !== confirmPassword) {
            Utils.Alert({
                alert: 'error',
                title: 'Password mismatch',
                message: 'The passwords you entered do not match. Please try again.',
            })
            return;
        }

        if (username.toLowerCase().includes('admin')) {
            Utils.Alert({
                alert: 'error',
                title: 'Invalid username',
                message: 'Please avoid using the word "admin" in your username, to proceed with registration process choose a different username.',
            })
            return;
        }

        Utils.Loading.Show();
        Utils.DBProcess('Database/Select/select_username.php', { username: username }).then(res => {
            if (res.status == 'Success') {
                if (res.data.length > 0) {
                    Utils.Loading.Hide();
                    Utils.Alert({
                        alert: 'error',
                        title: 'Username already exists',
                        message: 'The username you entered already exists. Please choose a different username.',
                    })
                }
                else {
                    Utils.DBProcess('Database/Insert/insert_user.php', {
                        fname: firstName,
                        lname: lastName,
                        department: department,
                        username: username,
                        password: password
                    }).then(res => {
                        Utils.Loading.Hide();
                        if (res.status == 'Success') {
                            ResetForm();
                            Utils.Toast({
                                toast: 'success',
                                message: 'Registration successful.'
                            });
                        }
                        else {
                            Utils.Toast({
                                toast: 'fail',
                                message: res.message
                            })
                        }
                    })
                }
            }
            else {
                Utils.Loading.Hide();
                Utils.Alert({
                    alert: 'error',
                    title: 'Error checking username',
                    message: 'There was an error checking the username. Please try again later. If the problem persists, please contact support.',
                }); 
            }
        })

        

        // console.log(firstName, lastName, department, username, password, confirmPassword);
    });

    function ResetForm() {
        Select('#first-name').value = '';
        Select('#last-name').value = '';
        Select('#department').value = '';
        Select('#username').value = '';
        Select('#password').value = '';
        Select('#confirm-password').value = '';
    }
}