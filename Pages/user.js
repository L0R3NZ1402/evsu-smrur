import {
    Utils,
    Select
} from "../Utilities/util.js";


export function init() {
    const currentUser = JSON.parse(localStorage.getItem('user_data'));

    if (currentUser == null) {
        window.location.href = "./?page=/signin";
    }

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
                            
                            if (room.user == currentUser.id) {
                                item.btnEndUsage.classList.remove('hidden');
                            }

                            avatar.classList.add(...avatarColors.InUse);
                            break;
                    }

                    item.btnUseRoom.addEventListener('click', () => {
                        Room.Use(room.id);
                    });

                    item.btnEndUsage.addEventListener('click', () => {
                        Room.EndUsage(room.id, room.usage_stamp, room.user);
                    });

                    return item.root;
                })
            );

            Select("#roomListContainer").replaceChildren(...elements);
        });
    }

    Select('.toggleUserSidebarBTN').forEach((element) => {
        element.addEventListener('click', () => {
            toggleMobileSidebar();
        });
    });

    // Toggle Mobile Sidebar Drawer Open/Close
    function toggleMobileSidebar(forceClose = false) {
        const sidebar = document.getElementById('userSidebar');
        const overlay = document.getElementById('userMobileOverlay');

        if (!sidebar || !overlay) return;

        const isOpen = !sidebar.classList.contains('-translate-x-full');

        // Close if already open or forceClose is true
        if (isOpen || forceClose) {
            sidebar.classList.remove('translate-x-0');
            sidebar.classList.add('-translate-x-full');

            overlay.classList.add('opacity-0');

            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 200);

        } else {
            // Open Mobile Sidebar
            overlay.classList.remove('hidden');

            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.add('translate-x-0');

            requestAnimationFrame(() => {
                overlay.classList.remove('opacity-0');
            });
        }
    }

    const Room = {
        Use: (roomId) => {
            Utils.Alert({
                alert: 'info',
                title: 'Room Usage Policy and Responsibility',
                message: `Please ensure that you end your room usage in the system immediately after you are finished. This will mark the room as available for the next user. <br><br>

Failure to end your usage will result in the room remaining marked as occupied, and you may be held responsible for the entire period it remains in use under your account.<br><br>

As the registered user, you are responsible for the condition of the room throughout your usage period. Any damages, missing equipment, or reported issues regarding the room's condition may be attributed to you.<br><br>

Please use the room responsibly, check its condition before and after use, and always end your usage once you are done. Thank you for helping us maintain an orderly and accountable room reservation system.`,
                showCancel: true
            }).then((res) => {
                if (res.isConfirmed) {
                    Utils.Loading.Show();
                    Utils.DBProcess('Database/Update/update_room_status.php', { id: roomId, status: 'InUse', user: currentUser.id, usage_stamp: 'yes' }).then((res) => {
                        if (res.status == 'Success') {
                            Utils.Loading.Hide();
                            Utils.Toast({
                                toast: 'success',
                                message: 'Room has been marked as in use.'
                            });
                            GetRooms();
                        }
                    })
                }
            })
        },

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

    // Close sidebar when clicking the overlay
    // Select('#userMobileOverlay')?.addEventListener('click', () => toggleMobileSidebar(true));


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
}