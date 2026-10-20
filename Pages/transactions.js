import {
    Utils,
    Select
} from "../Utilities/util.js";

import {
    InitializeLayout
} from "../Pages/global.js";

export function init() {
    InitializeLayout('#transactionsNav');
    const user = JSON.parse(localStorage.getItem("currentuser"));
    //Products Load
    Utils.DBProcess('Database/Select/select_transactions.php', { branch: user.branchId }).then(async data => {
        const transactions = Object.entries(data.data);

        Utils.DBProcess('Database/Select/select_transaction_items.php').then(async data => {
            const transactionItems = Object.entries(data.data);

            const template = await Utils.Template.Load('transactions.template.html');

            const elements = await Promise.all(
                transactions.map(async ([key, transaction]) => {
                    const item = await Utils.Template.ReadTemplate(template);

                    // Get all items belonging to this transaction
                    const transItems = transactionItems.filter(
                        ([key, transItem]) => transItem.transaction == transaction.id
                    );

                    // console.log('Items:', transItems);

                    item.transactionNo.innerText = `#${transaction.transaction}`;
                    item.transactionCashier.innerText = 'Cashier: ' + transaction.name;
                    item.transactionDate.innerText = splitTimestamp(transaction.timestamp).date;
                    item.transactionTime.innerText = splitTimestamp(transaction.timestamp).time;
                    item.transactionAmount.innerText = Utils.FormatPHPCurrency(transaction.total);
                    item.transactionItems.innerText = `${transItems.length} Item/s`;
                    item.transactionSubtotal.innerText = `Subtotal: ${Utils.FormatPHPCurrency(transaction.total)} | Tax: ${Utils.FormatPHPCurrency(0.00)}`;
                    item.transactionCashTendered.innerText = Utils.FormatPHPCurrency(transaction.cash);
                    item.transactionChangeReturned.innerText = Utils.FormatPHPCurrency(transaction.change_f);
                    item.transactionRow.setAttribute('data-product', transaction.transaction);

                    const wrapper = item.transactionDetailsWrapper;

                    wrapper.classList.add('hidden');

                    item.transactionExpandDetails.addEventListener('click', () => {

                        if (wrapper.classList.contains('hidden')) {
                            item.transactionExpandDetailsIcon.classList.add('rotate-180');

                            // Show the wrapper
                            wrapper.classList.remove('hidden');

                            // Start at zero
                            wrapper.style.height = '0px';

                            // Force the browser to render the collapsed state
                            requestAnimationFrame(() => {
                                wrapper.style.height = `${wrapper.scrollHeight}px`;
                            });

                            // Remove explicit height after animation
                            wrapper.addEventListener('transitionend', () => {
                                wrapper.style.height = 'auto';
                            }, { once: true });

                        } else {
                            item.transactionExpandDetailsIcon.classList.remove('rotate-180');

                            // Set the current height first
                            wrapper.style.height = `${wrapper.scrollHeight}px`;

                            requestAnimationFrame(() => {
                                wrapper.style.height = '0px';
                            });

                            // Completely remove it after animation
                            wrapper.addEventListener('transitionend', () => {
                                wrapper.classList.add('hidden');
                            }, { once: true });
                        }
                    });

                    let transactionItemsCard = '';
                    transItems.forEach(element => {
                        const item = element[1];
                        transactionItemsCard += `
                        <div class="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                            <div class="flex items-center gap-2">
                                <span
                                    class="w-5 h-5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-600 flex items-center justify-center">${item.qty}x</span>
                                <span class="font-semibold text-slate-800">${item.name}</span>
                                <span class="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">${item.category}</span>
                            </div>
                            <div class="text-right font-mono">
                                <span class="font-bold text-slate-800 ml-3">${Utils.FormatPHPCurrency(item.price)}</span>
                            </div>
                        </div>`;
                    });

                    item.transactionItemsList.innerHTML = transactionItemsCard;

                    return item.root;
                })
            );

            Select("#transactionsTable").replaceChildren(...elements);
            showProducts();
        });
    });

    Select('#searchProduct').addEventListener('input', () => {
        const searchValue = Select('#searchProduct').value.toLowerCase().trim();

        Select('.productItem').forEach(element => {
            const productName = element.getAttribute('data-product').toLowerCase();

            if (productName.includes(searchValue)) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    });

    Select('.table-nav').forEach(element => {
        element.addEventListener('click', () => {
            const nav = element.getAttribute('data-nav');
            if (nav === 'next') {
                nextProducts();
            } else if (nav === 'prev') {
                previousProducts();
            }
        });
    });

    function splitTimestamp(timestamp) {
        const [datePart, timePart] = timestamp.split(" ");

        // Format date
        const [year, month, day] = datePart.split("-").map(Number);
        const date = new Date(year, month - 1, day);

        const readableDate = date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });

        // Format time
        let [hours, minutes, seconds] = timePart.split(":").map(Number);

        const period = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;

        const readableTime = `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${period}`;

        return {
            date: readableDate,
            time: readableTime
        };
    }

    const itemsPerPage = 10;
    let currentPage = 0;


    function showProducts() {
        const items = document.querySelectorAll(
            "#transactionsTable .productItem"
        );

        const start = currentPage * itemsPerPage;
        const end = Math.min(start + itemsPerPage, items.length);

        items.forEach((item, index) => {
            item.style.display =
                index >= start && index < end ? "" : "none";
        });

        document.querySelector("#tableInfo").textContent =
            `Showing ${start + 1} to ${end} of ${items.length} `;
        Select('#currentPage').textContent = currentPage + 1;
    }

    function nextProducts() {
        const items = document.querySelectorAll(
            "#transactionsTable .productItem"
        );

        const totalPages = Math.ceil(items.length / itemsPerPage);

        if (currentPage < totalPages - 1) {
            currentPage++;
            showProducts();
        }
    }

    function previousProducts() {
        if (currentPage > 0) {
            currentPage--;
            showProducts();
        }
    }

}