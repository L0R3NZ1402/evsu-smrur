import {
    Utils,
    Select
} from "../Utilities/util.js";

import {
    InitializeLayout,
    Modals,
    currentUser
} from "../Pages/global.js";

export function init() {

    // console.log("Dashboard initialized");
    InitializeLayout("#inventoryNav");

    const RestockItem = {

        currentRestock: 0,

        item: {
            id: null,
            qty_k: 0,
            qty_k2: 0,
            qty_s: 0,
            qty_s2: 0,
            unit: null,
        },

        // Items removed from the original kitchen stock
        kitchenRecovery: 0,

        // Items that were moved from Main Stock into Kitchen
        kitchenFromMain: 0,

        Kitchen: {

            Add: function () {

                RestockItem.item.qty_k = Number(RestockItem.item.qty_k);
                RestockItem.item.qty_s = Number(RestockItem.item.qty_s);

                /*
                 * First recover items that were previously
                 * removed from the Kitchen.
                 *
                 * This does NOT touch Main Stock.
                 */
                if (RestockItem.kitchenRecovery > 0) {

                    RestockItem.item.qty_k += 1;
                    RestockItem.kitchenRecovery -= 1;

                    RestockItem.Update();
                    return;
                }

                /*
                 * Kitchen has already recovered to its
                 * previous level.
                 *
                 * Now take from Main Stock.
                 */
                if (RestockItem.item.qty_s > 0) {

                    RestockItem.item.qty_k += 1;
                    RestockItem.item.qty_s -= 1;

                    // Remember that this Kitchen item
                    // came from Main Stock.
                    RestockItem.kitchenFromMain += 1;

                    RestockItem.Update();
                }
            },

            Remove: function () {

                RestockItem.item.qty_k = Number(RestockItem.item.qty_k);
                RestockItem.item.qty_s = Number(RestockItem.item.qty_s);

                if (RestockItem.item.qty_k <= 0) return;

                RestockItem.item.qty_k -= 1;

                /*
                 * If Kitchen currently contains items that
                 * were taken from Main Stock, return those
                 * items to Main Stock first.
                 */
                if (RestockItem.kitchenFromMain > 0) {

                    RestockItem.item.qty_s += 1;
                    RestockItem.kitchenFromMain -= 1;

                } else {

                    /*
                     * This item came from the original Kitchen
                     * stock, so remember that it was removed.
                     */
                    RestockItem.kitchenRecovery += 1;
                }

                RestockItem.Update();
            }
        },

        Stock: {

            Add: function () {

                RestockItem.currentRestock += 1;

                RestockItem.Update();
            },

            Remove: function () {

                if (RestockItem.currentRestock <= 0) return;

                RestockItem.currentRestock -= 1;

                RestockItem.Update();
            }
        },

        Update: function () {

            RestockItem.item.qty_k = Number(RestockItem.item.qty_k);
            RestockItem.item.qty_s = Number(RestockItem.item.qty_s);

            RestockItem.kitchenRecovery =
                Number(RestockItem.kitchenRecovery);

            RestockItem.kitchenFromMain =
                Number(RestockItem.kitchenFromMain);

            Select('#currentStorageStockVal').innerText =
                RestockItem.item.qty_s;

            Select('#kitchenStockInput').value =
                RestockItem.item.qty_k;

            Select('#addMainStockInput').value =
                RestockItem.currentRestock;

            Select('.currentItemUnit').forEach(
                element => element.innerText = RestockItem.item.unit
            );
        }
    };

    Utils.DBProcess('Database/Select/select_inventory.php', { branch: currentUser.branchId }).then(async data => {
        const intItem = Object.entries(data.data);
        Select('#totalItemsTracked').textContent = `${intItem.length} Items`;

        const template = await Utils.Template.Load('inventory-item.template.html');
        let totalStockValue = 0;
        let totalLowStock = 0;
        const elements = await Promise.all(
            intItem.map(async ([key, inventory]) => {
                const item = await Utils.Template.ReadTemplate(template);

                item.inventoryItem.innerText = inventory.item;
                item.inventoryCategory.innerText = inventory.category;
                item.inventoryUnit.innerText = inventory.unit;
                item.inventoryQtyK.innerText = inventory.qty_k;
                item.inventoryQtyS.innerText = inventory.qty_s;
                item.inventoryCost.innerText = `${Utils.FormatPHPCurrency(inventory.cost) } / ${inventory.unit}`;
                const est = (Number(inventory.qty_k) + Number(inventory.qty_s)) * Number(inventory.cost);
                item.inventoryEstimatedValue.innerText = Utils.FormatPHPCurrency(est);
                totalStockValue += Number(est);
                
                item.inventoryTransfer.addEventListener('click', () => {
                    Modals.Show(Select("#restockIngredientModal"), Select("#restockIngredientModalCard"));
                    Select('#restockItemName').innerText = inventory.item;
                    RestockItem.item.id = inventory.id;
                    RestockItem.item.qty_k = inventory.qty_k;
                    RestockItem.item.qty_s = inventory.qty_s;
                    RestockItem.item.qty_k2 = inventory.qty_k;
                    RestockItem.item.qty_s2 = inventory.qty_s;
                    RestockItem.item.unit = inventory.unit;
                    RestockItem.Update();
                });

                const lowKitchenStock = inventory.qty_k < inventory.min_k;
                const lowStockStock = inventory.qty_s < inventory.min_s;

                if (lowKitchenStock) {
                    item.inventoryQtyK.classList.remove('text-slate-800');
                    item.inventoryQtyK.classList.add('text-rose-600');
                }

                if (lowStockStock) {
                    item.inventoryQtyS.classList.remove('text-slate-800');
                    item.inventoryQtyS.classList.add('text-rose-600');
                }

                if (lowKitchenStock && lowStockStock) {
                    item.inventoryLowStockAlert.classList.remove('invisible');
                    item.inventoryItemRow.classList.add('bg-rose-50/20');
                    totalLowStock += 1;
                }


                item.inventoryItemRow.setAttribute('data-product', inventory.item);
                item.inventoryItemRow.setAttribute('data-category', inventory.category);
                item.inventoryItemRow.setAttribute('data-stock', lowKitchenStock && lowStockStock);
                return item.root;
            })
        );
        Select('#totalValuation').textContent = Utils.FormatPHPCurrency(totalStockValue);
        Select('#lowStockAlerts').textContent = `${totalLowStock} Items`;

        Select("#inventoryTable").replaceChildren(...elements);
        showProducts();
    });

    Select('#addIngredientBtn').addEventListener('click', () => Modals.Show(Select("#addInventoryModal"), Select("#addInventoryModalCard")));
    Select('.cancelAddIngredientModalBtn').forEach(element => {
        element.addEventListener('click', () => Modals.Hide(Select("#addInventoryModal"), Select("#addInventoryModalCard")));
    });
    
    Select('#saveIngredientBtn').addEventListener('click', addIngredient);
    Select('#addIngredientQtyKitchen').addEventListener('input', () => {
        if (Select('#addIngredientCost').value != '') {
            const total = (Number(Select('#addIngredientQtyKitchen').value) + Number(Select('#addIngredientQtyStock').value)) * Number(Select('#addIngredientCost').value);
            Select('#addIngredientTotalValue').innerText = Utils.FormatPHPCurrency(total);
        }
    });

    Select('#addIngredientQtyStock').addEventListener('input', () => {
        if (Select('#addIngredientCost').value != '') {
            const total = (Number(Select('#addIngredientQtyKitchen').value) + Number(Select('#addIngredientQtyStock').value)) * Number(Select('#addIngredientCost').value);
            Select('#addIngredientTotalValue').innerText = Utils.FormatPHPCurrency(total);
        }
    });

    Select('#increaseRestockBtn').addEventListener('click', () => {
        RestockItem.Stock.Add();
    });

    Select('#decreaseRestockBtn').addEventListener('click', () => {
        RestockItem.Stock.Remove();
    });

    Select('#increaseKitchenBtn').addEventListener('click', () => {
        RestockItem.Kitchen.Add();
    });

    Select('#decreaseKitchenBtn').addEventListener('click', () => {
        RestockItem.Kitchen.Remove();
    });

    Select('.cancelRestockModalBtn').forEach(element => {
        element.addEventListener('click', () => Modals.Hide(Select("#restockIngredientModal"), Select("#restockIngredientModalCard")));
    })

    Select('#confirmRestockBtn').addEventListener('click', () => {
        UpdateStock(RestockItem.item);
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

    Select('#searchLowHighStocks').addEventListener('input', () => {
        const searchValue = Select('#searchLowHighStocks').value.toLowerCase().trim();

        // console.log(searchValue);

        Select('.productItem').forEach(element => {
            const productName = element.getAttribute('data-stock').toLowerCase();
            // console.log(productName);

            if (productName.includes(searchValue)) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    });

    Select('#selectedCategory').addEventListener('change', () => {
        const selectedCategory = Select('#selectedCategory').value;

        Select('.productItem').forEach(element => {
            const productCategory = element.getAttribute('data-category');

            if (productCategory === selectedCategory || selectedCategory === '') {
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

    const itemsPerPage = 10;
    let currentPage = 0;


    function showProducts() {
        const items = document.querySelectorAll(
            "#inventoryTable .productItem"
        );

        const start = currentPage * itemsPerPage;
        const end = Math.min(start + itemsPerPage, items.length);

        items.forEach((item, index) => {
            item.style.display =
                index >= start && index < end ? "" : "none";
        });

        document.querySelector("#tableInfo").textContent =
            `Showing ${ start + 1 } to ${ end } of ${ items.length } `;
        Select('#currentPage').textContent = currentPage + 1;
    }

    function nextProducts() {
        const items = document.querySelectorAll(
            "#inventoryTable .productItem"
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

    function addIngredient() {
        const item = Select('#addIngredientName').value;
        const category = Select('#addIngredientCategory').value;
        const unit = Select('#addIngredientUnit').value;
        const qty_k = Select('#addIngredientQtyKitchen').value;
        const qty_s = Select('#addIngredientQtyStock').value;
        const min_k = Select('#addIngredientMinKitchen').value;
        const min_s = Select('#addIngredientMinStock').value;
        const cost = Select('#addIngredientCost').value;

        if (!item || !category || !unit || !qty_k || !qty_s || !cost || !min_k || !min_s) {
            Utils.Alert({
                alert: 'warning',
                title: 'Oops, missing some details',
                message: 'It looks like a few required fields are still empty. Please add the missing details so we can get this item listed right away.'
            })
            return;
        }
        
        Utils.Loading.Show();
        Utils.DBProcess('Database/Insert/insert_inventory.php', {
            branch: currentUser.branchId,
            item: item,
            category: category,
            unit: unit,
            qty_k: qty_k,
            qty_s: qty_s,
            cost: cost,
            min_k: min_k,
            min_s: min_s
        }).then(res => {
            Utils.Loading.Hide();
            if (res.status == 'Success') {
                Utils.Alert({
                    alert: 'success',
                    title: 'Item has been added',
                    message: 'Success! Your item has been added. You can now view the live listing, edit its details, or add another item.'
                }).then(() => {
                    location.reload();
                })
            }
            else {
                Utils.Alert({
                    alert: 'error',
                    title: 'Error adding item',
                    message: 'There was an error adding this item. Please try again later. If the problem persists, please contact support.'
                })
            }
        });
    }

    function UpdateStock(item) {
        Utils.Alert({
            alert: 'info',
            title: 'Are you sure?',
            message: 'Are you sure you want to update the stock quantity for this item? This action cannot be undone.',
            showCancel: true
        }).then(res => {
            if (res.isConfirmed) {
                Utils.Loading.Show();
                Utils.DBProcess('Database/Update/update_inventory_stock.php', {
                    qty_k: item.qty_k,
                    qty_s: item.qty_s + Number(RestockItem.currentRestock),
                    id: item.id
                }).then(res => {
                    Utils.Loading.Hide();
                    if (res.status == 'Success') {
                        Utils.Alert({
                            alert: 'success',
                            title: 'Item has been updated',
                            message: 'Success! Your item has been updated. You can now view the live listing, edit its details, or add another item.'
                        }).then(() => {
                            location.reload();
                        });
                    }
                    else {
                        Utils.Alert({
                            alert: 'error',
                            title: 'Error updating item',
                            message: 'There was an error updating this item. Please try again later. If the problem persists, please contact support.'
                        })
                    }
                })
            }
        })
    }
}