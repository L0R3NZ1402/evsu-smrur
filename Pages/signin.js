import {
    Utils,
    Select
} from "../Utilities/util.js";


export function init() {
    localStorage.removeItem('user_data');
    Select('#signinBtn').addEventListener("click", () => {
        const username = Select('#signin-username').value;
        const password = Select('#signin-password').value;

        if (!username || !password) {
            Utils.Alert({
                alert: 'warning',
                title: 'Oops, missing some details',
                message: 'It looks like a few required fields are still empty. Please add the missing details so we can get you signed in right away.'
            });
            return;
        }

        if (username == 'iamtheadmin' && password == 'iamtheadmin') {
            Utils.Alert({
                alert: 'success',
                title: 'Success!',
                message: 'Welcome, admin! You have successfully signed in. You can now manage the system.'
            }).then(() => {
                localStorage.setItem('admin', true);
                window.location.href = "./?page=/admin";
            });
            return;
        }

        Utils.Loading.Show();
        Utils.DBProcess('Database/Select/select_user.php', { username: username, password: password }).then(res => {
            Utils.Loading.Hide();
            if (res.status == 'Success') {
                console.log(res);
                if (res.data.length == 0) {
                    Utils.Alert({
                        alert: 'error',
                        title: 'Invalid credentials',
                        message: 'The username or password you entered is incorrect. Please try again.'
                    });
                }
                else {
                    if (res.data[0].status == 'Inactive') {
                        Utils.Alert({
                            alert: 'error',
                            title: 'Account is inactive',
                            message: 'Your account is currently inactive. Please contact support for more information.'
                        });
                        return;
                    }
                    else if (res.data[0].status == 'Pending') {
                        Utils.Alert({
                            alert: 'info',
                            title: 'Account is pending',
                            message: 'Your account is currently pending. Please contact support for more information.'
                        });
                        return;
                    }

                    Utils.Alert({
                        alert: 'success',
                        title: 'Success!',
                        message: 'You have successfully signed in. You can now manage your room access.'
                    }).then(() => {
                        localStorage.setItem('user_data', JSON.stringify(res.data[0]));
                        window.location.href = "./?page=/user";
                    });
                }
            }
            else {
                Utils.Alert({
                    alert: 'error',
                    title: 'Error signing in',
                    message: 'There was an error signing you in. Please try again later. If the problem persists, please contact support.'
                });
            }
        });
    })


}