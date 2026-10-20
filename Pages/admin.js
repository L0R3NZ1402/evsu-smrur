import {
    Utils,
    Select
} from "../Utilities/util.js";


export function init() {
    if (!localStorage.getItem('admin')) {
        window.location.href = "./?page=/signin";
    }

    Select('.toggleSideBarBTN').forEach(element => {
        element.addEventListener("click", () => toggleMobileSidebar())
    });

    // Toggle Mobile Sidebar Drawer Open/Close
    function toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');

        if (sidebar.classList.contains('-translate-x-full')) {
            // Open Mobile Sidebar
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.add('translate-x-0');

            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        } else {
            // Close Mobile Sidebar
            sidebar.classList.remove('translate-x-0');
            sidebar.classList.add('-translate-x-full');

            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 200);
        }
    }

    Select('.navBtns').forEach(element => {
        element.addEventListener("click", () => {
            const nav = element.getAttribute('data-nav');
            console.log(nav);

            Select('.navBtns').forEach(element => {
                element.addEventListener('click', () => {
                    const nav = element.dataset.nav;
                    console.log(nav);

                    Select('.navBtns').forEach(el => {
                        el.classList.remove('active', 'bg-indigo-600', 'text-white');
                        el.classList.add('text-slate-400');
                    });

                    element.classList.add('active', 'bg-indigo-600', 'text-white');
                    element.classList.remove('text-slate-400');
                });
            });

            element.classList.add(
                'bg-indigo-600',
                'text-white'
            );

            element.classList.remove('text-slate-400');

            Select('.navContent').forEach(element => {
                element.classList.add('hidden');
            });

            Select(`#${nav}-Section`).classList.remove('hidden');
        });
    });
    
    GetUsers();

    function GetUsers() {
        Utils.DBProcess('Database/Select/select_users.php', {}).then(async data => {
            const users = Object.entries(data.data);

            const template = await Utils.Template.Load('users.template.html');

            const elements = await Promise.all(
                users.map(async ([key, user]) => {
                    const item = await Utils.Template.ReadTemplate(template);

                    item.user_name.innerText = `${user.lname}, ${user.fname}`;
                    item.user_avatar.innerText = user.fname.charAt(0) + user.lname.charAt(0);
                    item.user_department.innerText = user.department;
                    item.user_username.innerText = user.username;
                    item.user_password.innerText = user.password;
                    item.containerParent.setAttribute('data-user', `${user.fname} ${user.lname}`);
                    item.containerParent.setAttribute('data-status', user.status);


                    const wrapper = item.userDetailsWrapper;

                    // Ensure details are hidden initially
                    wrapper.classList.add('hidden');

                    item.userExpandDetails.addEventListener('click', (event) => {
                        // Prevent the click from triggering parent row events
                        event.stopPropagation();

                        if (wrapper.classList.contains('hidden')) {
                            // Rotate the expand icon
                            item.userExpandDetailsIcon.classList.add('rotate-180');

                            // Show the details wrapper
                            wrapper.classList.remove('hidden');

                            // Start at zero height
                            wrapper.style.height = '0px';

                            // Animate to the full content height
                            requestAnimationFrame(() => {
                                wrapper.style.height = `${wrapper.scrollHeight}px`;
                            });

                            // Reset height after animation
                            wrapper.addEventListener('transitionend', () => {
                                wrapper.style.height = 'auto';
                            }, { once: true });

                        } else {
                            // Rotate the expand icon back
                            item.userExpandDetailsIcon.classList.remove('rotate-180');

                            // Set current height before collapsing
                            wrapper.style.height = `${wrapper.scrollHeight}px`;

                            requestAnimationFrame(() => {
                                wrapper.style.height = '0px';
                            });

                            // Hide the wrapper after animation
                            wrapper.addEventListener('transitionend', () => {
                                wrapper.classList.add('hidden');
                                wrapper.style.height = '';
                            }, { once: true });
                        }
                    });

                    // Avatar color classes
                    const avatarColors = {
                        Active: [
                            'bg-emerald-50',
                            'text-emerald-600',
                            'border-emerald-100'
                        ],
                        Inactive: [
                            'bg-rose-50',
                            'text-rose-600',
                            'border-rose-100'
                        ],
                        Pending: [
                            'bg-amber-50',
                            'text-amber-600',
                            'border-amber-100'
                        ]
                    };

                    // Apply avatar colors based on status
                    const avatar = item.user_avatar;

                    switch (user.status) {
                        case 'Active':
                            item.user_status_badge_active.classList.remove('hidden');
                            item.btnDeactivateUser.classList.remove('hidden');

                            avatar.classList.add(...avatarColors.Active);
                            break;

                        case 'Inactive':
                            item.user_status_badge_inactive.classList.remove('hidden');
                            item.btnActivateUser.classList.remove('hidden');

                            avatar.classList.add(...avatarColors.Inactive);
                            break;

                        case 'Pending':
                            item.user_status_badge_pending.classList.remove('hidden');
                            item.btnActivateUser.classList.remove('hidden');
                            item.btnDeleteUser.classList.remove('hidden');

                            avatar.classList.add(...avatarColors.Pending);
                            break;
                    }

                    item.btnDeactivateUser.addEventListener('click', () => UserAction.Deactivate(user.id));
                    item.btnActivateUser.addEventListener('click', () => UserAction.Activate(user.id));
                    item.btnDeleteUser.addEventListener('click', () => {
                        Utils.Alert({
                            alert: 'warning',
                            title: "Delete User",
                            message: "Are you sure you want to delete this user?",
                            showCancel: true,
                        }).then(res => {
                            if (res.isConfirmed) {
                                UserAction.Delete(user.id);
                            }
                        })
                    });

                    return item.root;
                })
            );

            Select("#userListContainer").replaceChildren(...elements);
        });
    }

    const UserAction = {

        UpdateUserStatus(user_id, status) {
            // console.log(user_id, status);
            Utils.Loading.Show();
            Utils.DBProcess('Database/Update/update_user_status.php', { id: user_id, status: status }).then(res => {
                Utils.Loading.Hide();
                if (res.status == 'Success') {
                    GetUsers();
                    Utils.Toast({
                        toast: 'success',
                        message: 'Success! User status has been updated.'
                    });
                }
                else {
                    Utils.Alert({
                        alert: 'error',
                        title: 'Error updating user status',
                        message: 'There was an error updating the user status. Please try again later. If the problem persists, please contact support.'
                    });
                }
            });
        },


        Activate: (user_id) => UserAction.UpdateUserStatus(user_id, 'Active'),
        Deactivate: (user_id) => UserAction.UpdateUserStatus(user_id, 'Inactive'),
        Pending: (user_id) => UserAction.UpdateUserStatus(user_id, 'Pending'),

        Delete: (user_id) => {
            Utils.Loading.Show();
            Utils.DBProcess('Database/Delete/delete_user.php', { id: user_id }).then(res => {
                Utils.Loading.Hide();
                if (res.status == 'Success') {
                    GetUsers();
                    Utils.Toast({
                        toast: 'success',
                        message: 'Success! User has been deleted.'
                    });
                }
                else {
                    Utils.Alert({
                        alert: 'error',
                        title: 'Error deleting user',
                        message: 'There was an error deleting the user. Please try again later. If the problem persists, please contact support.'
                    });
                }
            });
        }


    }

    Select('#searchUser').addEventListener('input', () => {
        const searchValue = Select('#searchUser').value.toLowerCase().trim();

        Select('.user-data').forEach(element => {
            const userName = element.getAttribute('data-user').toLowerCase();

            if (userName.includes(searchValue)) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    });

    
    Select('#searchUserStatus').addEventListener('input', () => {
        const searchValue = Select('#searchUserStatus').value.toLowerCase().trim();

        Select('.user-data').forEach(element => {
            const userStatus = element.getAttribute('data-status').toLowerCase();

            if (userStatus.includes(searchValue)) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    });

    GetRooms();

    function GetRooms() {
        Utils.DBProcess('Database/Select/select_rooms.php', {}).then(async data => {
            const rooms = Object.entries(data.data);

            const template = await Utils.Template.Load('rooms.template.html');

            const elements = await Promise.all(
                rooms.map(async ([key, room]) => {
                    const item = await Utils.Template.ReadTemplate(template);

                    item.room_name.innerText = room.room;
                    item.room_avatar.innerText = room.room.charAt(0) + room.room.charAt(1);
                    item.room_location.innerText = room.location;
                    item.room_in_use_by.innerText = `${room.lname}, ${room.fname}`;
                    item.room_usage_time.innerText = formatTimestamp(room.usage_stamp);
                    item.user_department.innerText = room.department;


                    const wrapper = item.roomDetailsWrapper;

                    // Ensure details are hidden initially
                    wrapper.classList.add('hidden');

                    item.roomExpandDetails.addEventListener('click', (event) => {
                        // Prevent the click from triggering parent row events
                        event.stopPropagation();

                        if (wrapper.classList.contains('hidden')) {
                            // Rotate the expand icon
                            item.roomExpandDetailsIcon.classList.add('rotate-180');

                            // Show the details wrapper
                            wrapper.classList.remove('hidden');

                            // Start at zero height
                            wrapper.style.height = '0px';

                            // Animate to the full content height
                            requestAnimationFrame(() => {
                                wrapper.style.height = `${wrapper.scrollHeight}px`;
                            });

                            // Reset height after animation
                            wrapper.addEventListener('transitionend', () => {
                                wrapper.style.height = 'auto';
                            }, { once: true });

                        } else {
                            // Rotate the expand icon back
                            item.roomExpandDetailsIcon.classList.remove('rotate-180');

                            // Set current height before collapsing
                            wrapper.style.height = `${wrapper.scrollHeight}px`;

                            requestAnimationFrame(() => {
                                wrapper.style.height = '0px';
                            });

                            // Hide the wrapper after animation
                            wrapper.addEventListener('transitionend', () => {
                                wrapper.classList.add('hidden');
                                wrapper.style.height = '';
                            }, { once: true });
                        }
                    });

                    // // Avatar color classes
                    const avatarColors = {
                        Vacant: [
                            'bg-emerald-50',
                            'text-emerald-600',
                            'border-emerald-100'
                        ],
                        InUse: [
                            'bg-rose-50',
                            'text-rose-600',
                            'border-rose-100'
                        ],
                    };

                    // Apply avatar colors based on status
                    const avatar = item.room_avatar;

                    switch (room.status) {
                        case 'Vacant':
                            item.room_status_badge_vacant.classList.remove('hidden');
                            item.btnUseRoom.classList.remove('hidden');

                            avatar.classList.add(...avatarColors.Vacant);
                            break;

                        case 'InUse':
                            item.room_status_badge_inuse.classList.remove('hidden');
                            item.roomUsageInfo.classList.remove('hidden');

                            item.btnOverrideEndUsage.classList.remove('hidden');

                            avatar.classList.add(...avatarColors.InUse);
                            break;
                    }

                    item.btnUseRoom.addEventListener('click', () => {
                        Room.Use(room.id);
                    });

                    item.btnOverrideEndUsage.addEventListener('click', () => {
                        Room.EndUsage(room.id, room.usage_stamp, room.user);
                    });

                    return item.root;
                })
            );

            Select("#roomListContainer").replaceChildren(...elements);
        });
    }

    const Room = {

        EndUsage: (roomId, u_start, user) => {
            Utils.Alert({
                alert: 'info',
                title: 'End Room Usage?',
                message: 'Before ending your room usage, please ensure that the room is in a clean and tidy condition, and that all equipment is in working order.',
                showCancel: true
            }).then((res) => {
                if (res.isConfirmed) {
                    Utils.Loading.Show();
                    Utils.DBProcess('Database/Update/update_room_status.php', { id: roomId, status: 'Vacant', user: '', usage_stamp: '' }).then((res) => {
                        if (res.status == 'Success') {
                            Utils.DBProcess('Database/Insert/insert_log.php', {
                                room: roomId,
                                user: user,
                                u_start: u_start
                            }).then((res) => {
                                if (res.status == 'Success') {
                                    Utils.Loading.Hide();
                                    Utils.Toast({
                                        toast: 'success',
                                        message: 'Room has been marked as vacant.'
                                    });
                                    GetRooms();
                                }
                                else {
                                    Utils.Loading.Hide();
                                    Utils.Alert({
                                        alert: 'error',
                                        title: 'Error ending room usage',
                                        message: 'There was an error ending your room usage. Please try again later. If the problem persists, please contact support.'
                                    });
                                }
                            })
                        }
                        else {
                            Utils.Loading.Hide();
                            Utils.Alert({
                                alert: 'error',
                                title: 'Error ending room usage',
                                message: 'There was an error ending your room usage. Please try again later. If the problem persists, please contact support.'
                            });
                        }
                    });
                }
            })
        }
    }

    function formatTimestamp(timestamp) {
        if (!timestamp) return '—';

        const date = new Date(timestamp);

        if (isNaN(date.getTime())) return '—';

        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    GetLogs();

    function GetLogs() {
        Utils.DBProcess('Database/Select/select_logs.php').then(async data => {
            const logs = Object.entries(data.data);

            const template = await Utils.Template.Load('logs.template.html');

            const elements = await Promise.all(
                logs.map(async ([key, log]) => {
                    const item = await Utils.Template.ReadTemplate(template);

                    item.room_name.innerText = log.room;
                    item.log_date.innerText = formatTimestamp(log.timestamp);
                    item.log_used_by.innerText = ` ${log.lname}, ${log.fname}`;
                    item.log_user_department.innerText = log.department;
                    item.log_started_at.innerText = formatTimestamp(log.u_start);
                    item.log_ended_at.innerText = formatTimestamp(log.u_end);
                    item.containerParent.setAttribute('data-log', `${log.room} ${formatTimestamp(log.timestamp)}`);

                    const wrapper = item.logDetailsWrapper;

                    // Ensure details are hidden initially
                    wrapper.classList.add('hidden');
                    item.logExpandDetails.addEventListener('click', (event) => {
                        // Prevent the click from triggering parent row events
                        event.stopPropagation();

                        if (wrapper.classList.contains('hidden')) {
                            // Rotate the expand icon
                            item.logExpandDetailsIcon.classList.add('rotate-180');

                            // Show the details wrapper
                            wrapper.classList.remove('hidden');

                            // Start at zero height
                            wrapper.style.height = '0px';

                            // Animate to the full content height
                            requestAnimationFrame(() => {
                                wrapper.style.height = `${wrapper.scrollHeight}px`;
                            });

                            // Reset height after animation
                            wrapper.addEventListener('transitionend', () => {
                                wrapper.style.height = 'auto';
                            }, { once: true });

                        } else {
                            // Rotate the expand icon back
                            item.logExpandDetailsIcon.classList.remove('rotate-180');

                            // Set current height before collapsing
                            wrapper.style.height = `${wrapper.scrollHeight}px`;

                            requestAnimationFrame(() => {
                                wrapper.style.height = '0px';
                            });

                            // Hide the wrapper after animation
                            wrapper.addEventListener('transitionend', () => {
                                wrapper.classList.add('hidden');
                                wrapper.style.height = '';
                            }, { once: true });
                        }
                    });

                    // item.room_name.innerText = room.room;
                    // item.room_avatar.innerText = room.room.charAt(0) + room.room.charAt(1);
                    // item.room_location.innerText = room.location;
                    // item.room_in_use_by.innerText = `${room.lname}, ${room.fname}`;
                    // item.room_usage_time.innerText = formatTimestamp(room.usage_stamp);
                    // item.user_department.innerText = room.department;


                    // const wrapper = item.roomDetailsWrapper;

                    // // Ensure details are hidden initially
                    // wrapper.classList.add('hidden');

                    // item.roomExpandDetails.addEventListener('click', (event) => {
                    //     // Prevent the click from triggering parent row events
                    //     event.stopPropagation();

                    //     if (wrapper.classList.contains('hidden')) {
                    //         // Rotate the expand icon
                    //         item.roomExpandDetailsIcon.classList.add('rotate-180');

                    //         // Show the details wrapper
                    //         wrapper.classList.remove('hidden');

                    //         // Start at zero height
                    //         wrapper.style.height = '0px';

                    //         // Animate to the full content height
                    //         requestAnimationFrame(() => {
                    //             wrapper.style.height = `${wrapper.scrollHeight}px`;
                    //         });

                    //         // Reset height after animation
                    //         wrapper.addEventListener('transitionend', () => {
                    //             wrapper.style.height = 'auto';
                    //         }, { once: true });

                    //     } else {
                    //         // Rotate the expand icon back
                    //         item.roomExpandDetailsIcon.classList.remove('rotate-180');

                    //         // Set current height before collapsing
                    //         wrapper.style.height = `${wrapper.scrollHeight}px`;

                    //         requestAnimationFrame(() => {
                    //             wrapper.style.height = '0px';
                    //         });

                    //         // Hide the wrapper after animation
                    //         wrapper.addEventListener('transitionend', () => {
                    //             wrapper.classList.add('hidden');
                    //             wrapper.style.height = '';
                    //         }, { once: true });
                    //     }
                    // });

                    // // // Avatar color classes
                    // const avatarColors = {
                    //     Vacant: [
                    //         'bg-emerald-50',
                    //         'text-emerald-600',
                    //         'border-emerald-100'
                    //     ],
                    //     InUse: [
                    //         'bg-rose-50',
                    //         'text-rose-600',
                    //         'border-rose-100'
                    //     ],
                    // };

                    // // Apply avatar colors based on status
                    // const avatar = item.room_avatar;

                    // switch (room.status) {
                    //     case 'Vacant':
                    //         item.room_status_badge_vacant.classList.remove('hidden');
                    //         item.btnUseRoom.classList.remove('hidden');

                    //         avatar.classList.add(...avatarColors.Vacant);
                    //         break;

                    //     case 'InUse':
                    //         item.room_status_badge_inuse.classList.remove('hidden');
                    //         item.roomUsageInfo.classList.remove('hidden');

                    //         item.btnOverrideEndUsage.classList.remove('hidden');

                    //         avatar.classList.add(...avatarColors.InUse);
                    //         break;
                    // }

                    // item.btnUseRoom.addEventListener('click', () => {
                    //     Room.Use(room.id);
                    // });

                    // item.btnOverrideEndUsage.addEventListener('click', () => {
                    //     Room.EndUsage(room.id, room.usage_stamp, room.user);
                    // });

                    return item.root;
                })
            );

            Select("#logListContainer").replaceChildren(...elements);
        });
    }

    Select('#searchLogs').addEventListener('input', () => {
        const searchValue = Select('#searchLogs').value.toLowerCase().trim();

        Select('.log-data').forEach(element => {
            const logData = element.getAttribute('data-log').toLowerCase();

            if (logData.includes(searchValue)) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    });

}