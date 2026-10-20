export function Select(selector) {
    // ID selector → return a single element
    if (selector.startsWith("#")) {
        return document.querySelector(selector);
    }

    // Everything else → return an array
    return Array.from(document.querySelectorAll(selector));
}

export const Utils = {
    OpenLayout: async function (targetId, containerId, layoutFile) {
        try {
            // Find the existing element
            const target = document.getElementById(targetId);

            if (!target) {
                throw new Error(`Target with id "${targetId}" not found.`);
            }

            // Load the layout
            const response = await fetch(layoutFile);

            if (!response.ok) {
                throw new Error(
                    `Failed to load "${layoutFile}": ${response.status}`
                );
            }

            const html = await response.text();

            // Parse the loaded HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Find the container inside the loaded layout
            const container = doc.getElementById(containerId);

            if (!container) {
                throw new Error(
                    `Container with id "${containerId}" not found in "${layoutFile}".`
                );
            }

            // Move the target's contents into the layout container
            container.append(...target.childNodes);

            // Replace the original target with the loaded layout
            target.replaceWith(...doc.body.childNodes);

        } catch (error) {
            console.error("OpenLayout error:", error);
        }
    },

    DBProcess: async function (file, params = {}, method = 'POST') {

        const options = {
            method: method
        };

        if (method === 'GET') {

            const query = new URLSearchParams(params);

            file += '?' + query.toString();

        } else {

            options.headers = {
                'Content-Type': 'application/json'
            };

            options.body = JSON.stringify(params);
        }

        const response = await fetch(file, options);

        return await response.json();
    },

    Template: {
        cache: {},

        async Load(file) {

            const path = `Pages/Templates/${file}`;

            if (this.cache[path]) {
                return this.cache[path];
            }

            const res = await fetch(path);

            if (!res.ok) {
                throw new Error(`Template not found: ${path}`);
            }

            const html = await res.text();

            this.cache[path] = html;

            return html;
        },

        async ReadTemplate(templateHtml) {
            const template = document.createElement('template');

            template.innerHTML = templateHtml.trim();

            const root = template.content.firstElementChild;

            if (!root) {
                throw new Error('Template has no root element.');
            }

            const bindings = { root };

            // Include root itself if it has an ID
            const elements = [];

            if (root.id) {
                elements.push(root);
            }

            // Include all children with IDs
            elements.push(...root.querySelectorAll('[id]'));

            elements.forEach(el => {
                const id = el.id;

                const binding = {
                    el,

                    data: new Proxy({}, {
                        get(target, prop) {
                            return el.dataset[prop];
                        },

                        set(target, prop, value) {
                            if (value === null || value === undefined) {
                                delete el.dataset[prop];
                            } else {
                                el.dataset[prop] = value;
                            }

                            return true;
                        }
                    }),

                    toggleClass(class1, class2) {
                        const parse = str =>
                            typeof str === 'string'
                                ? str.split(/\s+/).filter(Boolean)
                                : [];

                        const group1 = parse(class1);
                        const group2 = parse(class2);

                        if (class2 !== undefined) {
                            const hasFirst = group1.some(cls =>
                                el.classList.contains(cls)
                            );

                            if (hasFirst) {
                                group1.forEach(cls => el.classList.remove(cls));
                                group2.forEach(cls => el.classList.add(cls));
                            } else {
                                group2.forEach(cls => el.classList.remove(cls));
                                group1.forEach(cls => el.classList.add(cls));
                            }
                        } else {
                            group1.forEach(cls => el.classList.toggle(cls));
                        }
                    },

                    click(fn) {
                        const old = VLM._clickStore.get(el);

                        if (old) {
                            el.removeEventListener('click', old);
                        }

                        const handler = e => fn(e);

                        VLM._clickStore.set(el, handler);
                        el.addEventListener('click', handler);
                    }
                };

                /*
                 * Proxy:
                 *
                 * item.productName.innerText
                 * item.productName.innerHTML
                 * item.productName.classList
                 * item.productName.style
                 * item.productName.setAttribute()
                 * item.productName.addEventListener()
                 *
                 * etc.
                 */
                bindings[id] = new Proxy(binding, {
                    get(target, prop) {
                        // Custom properties/methods
                        if (prop in target) {
                            return target[prop];
                        }

                        // Native DOM property/method
                        const value = el[prop];

                        if (typeof value === 'function') {
                            return value.bind(el);
                        }

                        return value;
                    },

                    set(target, prop, value) {
                        // Custom property
                        if (prop in target) {
                            target[prop] = value;
                            return true;
                        }

                        // Native DOM property
                        el[prop] = value;
                        return true;
                    }
                });
            });

            return bindings;
        }
    },

    FormatPHPCurrency: function (number) {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(number);
    },

    Alert(config) {
        return new Promise((resolve) => {

            const type = config.alert || 'info';
            const title = config.title || 'Notice';
            const message = config.message || 'Something happened.';
            const showCancel = config.showCancel || false;
            const confirmText = config.confirmText || (showCancel ? 'Confirm' : 'OK');

            const styles = {
                success: {
                    icon: 'bi-check-circle-fill',
                    iconBg: 'bg-emerald-100/70',
                    iconColor: 'text-emerald-600',
                    button: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                },
                error: {
                    icon: 'bi-x-circle-fill',
                    iconBg: 'bg-rose-100/70',
                    iconColor: 'text-rose-600',
                    button: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                },
                warning: {
                    icon: 'bi-exclamation-triangle-fill',
                    iconBg: 'bg-amber-100/70',
                    iconColor: 'text-amber-600',
                    button: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                },
                info: {
                    icon: 'bi-info-circle-fill',
                    iconBg: 'bg-indigo-100/70',
                    iconColor: 'text-indigo-600',
                    button: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                }
            };

            const style = styles[type] || styles.info;

            const cancelBtn = showCancel
                ? `
            <button
                type="button"
                id="alertCancelBtn"
                class="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors">
                Cancel
            </button>
            `
                : '';

            const html = `
        <div
            id="lumaAlertOverlay"
            class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 opacity-0 transition-opacity duration-200">

            <div
                id="lumaAlertCard"
                class="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-slate-100 opacity-0 scale-95 transition-all duration-200 ease-out text-center">

                <!-- Subtle Icon Badge -->
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full ${style.iconBg} ${style.iconColor} mb-3.5">
                    <i class="bi ${style.icon} text-xl"></i>
                </div>

                <!-- Title & Message -->
                <div class="space-y-1.5 px-1">
                    <h3 class="text-base font-bold text-slate-900 tracking-tight">
                        ${title}
                    </h3>
                    <p class="text-xs text-slate-500 leading-relaxed">
                        ${message}
                    </p>
                </div>

                <!-- Dynamic Actions Grid -->
                <div class="grid ${showCancel ? 'grid-cols-2 gap-2.5' : 'grid-cols-1'} mt-5">
                    ${cancelBtn}
                    <button
                        type="button"
                        id="alertConfirmBtn"
                        class="w-full py-2.5 px-4 rounded-xl ${style.button} font-medium text-xs transition-colors active:scale-95">
                        ${confirmText}
                    </button>
                </div>

            </div>
        </div>
        `;

            document.body.insertAdjacentHTML('beforeend', html);

            const overlay = document.getElementById('lumaAlertOverlay');
            const card = document.getElementById('lumaAlertCard');
            const confirmBtn = document.getElementById('alertConfirmBtn');
            const cancelBtnElement = document.getElementById('alertCancelBtn');

            // Show Animation
            requestAnimationFrame(() => {
                overlay.classList.remove('opacity-0');
                overlay.classList.add('opacity-100');

                card.classList.remove('opacity-0', 'scale-95');
                card.classList.add('opacity-100', 'scale-100');
            });

            // Close Handler
            function closeAlert(isConfirmed) {
                overlay.classList.remove('opacity-100');
                overlay.classList.add('opacity-0');

                card.classList.remove('opacity-100', 'scale-100');
                card.classList.add('opacity-0', 'scale-95');

                setTimeout(() => {
                    overlay.remove();
                    resolve({ isConfirmed });
                }, 200);
            }

            // Event Listeners
            confirmBtn.addEventListener('click', () => closeAlert(true));

            if (cancelBtnElement) {
                cancelBtnElement.addEventListener('click', () => closeAlert(false));
            }

            overlay.addEventListener('click', (event) => {
                if (event.target === overlay && showCancel) {
                    closeAlert(false);
                }
            });
        });
    },

    Toast(config) {
        return new Promise((resolve) => {

            const type = config.toast || 'success';
            const message = config.message || 'Action completed successfully.';

            const styles = {
                success: {
                    icon: 'bi-check-circle-fill',
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-100',
                    iconColor: 'text-emerald-600'
                },
                fail: {
                    icon: 'bi-x-circle-fill',
                    bg: 'bg-rose-50',
                    border: 'border-rose-100',
                    iconColor: 'text-rose-600'
                }
            };

            const style = styles[type] || styles.success;

            const html = `
        <div
            id="lumaToastContainer"
            class="fixed top-4 inset-x-0 flex justify-center z-50 pointer-events-none px-4">
            
            <div
                id="lumaToastCard"
                class="pointer-events-auto flex items-center gap-3 bg-white border ${style.border} rounded-2xl shadow-xl px-4 py-3 max-w-sm w-full translate-y-[-20px] opacity-0 transition-all duration-300 ease-out">
                
                <!-- Icon Badge -->
                <div class="w-8 h-8 rounded-full ${style.bg} ${style.iconColor} flex items-center justify-center shrink-0">
                    <i class="bi ${style.icon} text-sm"></i>
                </div>

                <!-- Message -->
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-slate-800 leading-snug">
                        ${message}
                    </p>
                </div>

            </div>
        </div>
        `;

            // Remove any existing toast immediately if triggered consecutively
            const existingToast = document.getElementById('lumaToastContainer');
            if (existingToast) {
                existingToast.remove();
            }

            document.body.insertAdjacentHTML('beforeend', html);

            const container = document.getElementById('lumaToastContainer');
            const card = document.getElementById('lumaToastCard');

            // =========================
            // SHOW ANIMATION
            // =========================

            requestAnimationFrame(() => {
                card.classList.remove('translate-y-[-20px]', 'opacity-0');
                card.classList.add('translate-y-0', 'opacity-100');
            });

            // =========================
            // AUTO DISMISS (3 Seconds)
            // =========================

            setTimeout(() => {
                // Hide Animation
                card.classList.remove('translate-y-0', 'opacity-100');
                card.classList.add('translate-y-[-20px]', 'opacity-0');

                setTimeout(() => {
                    container.remove();
                    resolve();
                }, 300); // Matches transition duration
            }, 3000);
        });
    },

    Loading: {
        Show(config = {}) {
            if (document.getElementById('lumaLoader')) {
                return;
            }

            const title = config.title || 'Ongoing Process';
            const message = config.message || 'Please wait while we complete your request.';

            const loader = `
            <div
                id="lumaLoader"
                class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">

                <div
                    class="bg-white rounded-2xl max-w-xs w-full p-6 shadow-xl border border-slate-100 text-center flex flex-col items-center">

                    <!-- Spinner Container -->
                    <div class="relative flex items-center justify-center w-12 h-12 mb-4">

                        <!-- Pulsing outer ring -->
                        <div
                            class="absolute inset-0 rounded-full bg-orange-100 animate-ping opacity-75">
                        </div>

                        <!-- Spinning loader -->
                        <div
                            class="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin">
                        </div>

                        <!-- Center Icon -->
                        <i
                            class="bi bi-arrow-repeat text-orange-600 text-xs absolute">
                        </i>

                    </div>

                    <!-- Title -->
                    <h3 class="text-sm font-bold text-slate-800">
                        ${title}
                    </h3>

                    <!-- Message -->
                    <p class="text-xs text-slate-500 mt-1">
                        ${message}
                    </p>

                </div>
            </div>
        `;

            document.body.insertAdjacentHTML('beforeend', loader);
        },

        Hide() {
            const loader = document.getElementById('lumaLoader');

            if (!loader) return;

            loader.style.transition = 'opacity 300ms ease';
            loader.style.opacity = '0';

            setTimeout(() => {
                loader.remove();
            }, 300);
        }
    },
}