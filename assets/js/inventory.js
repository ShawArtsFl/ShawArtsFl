var inventoryList;
var currentFilter = "";
var shipping = 7.99;

function buildInventoryList(jsonlist) {
   var template = $("#inventoryItem").html();
   var itemListWrapperId = '#inventoryListWrapper';
   var items = jsonlist;
   var soldOutItems = [];
   var firstItemAddedToShopList = false;

   if (items && items.length > 0) {
      items.forEach(buildListItem);
      soldOutItems.forEach(appendSoldOutItemsToList);
   } else {
      $(itemListWrapperId).removeClass();
      $(itemListWrapperId).html(
         '<div class=\"text-center\"><h4>No items available at this Time.  Check Back Soon!</h4></div>');
   }

   function appendSoldOutItemsToList(soItem) {
      if (!firstItemAddedToShopList) {
         $(itemListWrapperId).html(soItem);
      } else {
         $(itemListWrapperId).append(soItem);
      }
   }

   function buildListItem(item, index) {

      var listItem = $(template);

      var listItemId = $('#itemid', listItem);
      listItemId.text('#' + item.id);

      var listItemTitle = $('#name', listItem);
      listItemTitle.text(item.name);

      var listItemDesc = $('#itemdesc', listItem);
      listItemDesc.text(item.description);

      var listItemAddr = $('#itemprice', listItem);
      listItemAddr.text(item.price);

      var listItemfinish = $('#itemfinish', listItem);
      listItemfinish.text('Finish: ' + item.finish);

      var listItemWeb = $('#itemimg', listItem);
      listItemWeb.attr("src", 'https://s3.amazonaws.com/com.shawartsfl/inventory/' + item.id + '.jpg');

      var listItemDate = $('#itemcat', listItem);
      listItemDate.text(item.category);

      var listItemDate = $('#itemsize', listItem);
      listItemDate.text(item.size);

      if (item.foodsafe === 'yes') {
         var foodsafe = $('#foodSafe', listItem);
         foodsafe.removeAttr('hidden');
      }

      if (item.status === 'sold' || item.status === 'gift') {
         var listItemSo = $('#soldout', listItem);
         listItemSo.removeAttr('hidden');

         // prevents purchase button from showing
         var listItemHover = $('#purchaseBtn', listItem);
         listItemHover.attr('hidden', "");
      }

      // setting data
      var listItemWeb = $('#purchaseBtn', listItem);
      listItemWeb.attr("itemid", item.id);
      listItemWeb.attr("itemname", item.name);
      listItemWeb.attr("itemprice", item.price);

      if (item.status !== 'sold' && item.status !== 'gift') {
         // a way to make sure our first item is added correctly to the page
         if (!firstItemAddedToShopList) {
            $(itemListWrapperId).html(listItem);
            firstItemAddedToShopList = true;
         } else {
            $(itemListWrapperId).append(listItem);
         }
      } else {
         soldOutItems.push(listItem);
      }
   }
}

function filterCategory(categoryToFilter) {
   if (categoryToFilter !== currentFilter) {
      if (currentFilter != "") {
         //un-active current filter
         $('#' + currentFilter).removeClass('active');
      }

      if (categoryToFilter !== 'clear') {
         currentFilter = categoryToFilter;
         $('#' + currentFilter).addClass('active');

         var filtered = $.grep(inventoryList, function(item) {
            return item.category == categoryToFilter;
         });
         buildInventoryList(filtered);
      } else {
         // clear filter
         currentFilter = '';
         buildInventoryList(inventoryList);
      }
   } else {
      // clear filter if same filter is clicked twice
      if (currentFilter != "") {
         $('#' + currentFilter).removeClass('active');
      }
      currentFilter = '';
      buildInventoryList(inventoryList);
   }
}

function getInventory() {
   fetch('https://s3.amazonaws.com/com.shawartsfl/inventory.json')
      .then(function(response) {
         return response.json();
      })
      .then(function(myJson) {
         inventoryList = myJson;
         buildInventoryList(myJson);
      });
}
getInventory();

function showModal(element) {

   var itemid = element.getAttribute("itemid");
   var itemName = element.getAttribute("itemname");
   var itemPrice = element.getAttribute("itemprice");

   if (itemid) {
      $('#purchaseItemId').val('Item# ' + itemid);
      $('#purchaseItemName').text(itemName);
      $('#purchaseItemPrice').val(itemPrice);
      $('#shippingCost').val('$' + shipping);
      $('#purchaseItemImage').attr("src", 'https://s3.amazonaws.com/com.shawartsfl/inventory/' + itemid + '.jpg');

      $('#paypal-button-container').empty();
      $('#afterPurchaseMsg').empty();

      var priceForPaypal = itemPrice.replace('$', '');
      var taxAmount = (priceForPaypal * .07).toFixed(2);
      $('#tax').val('$' + taxAmount);
      var total = (+taxAmount) + shipping + (+priceForPaypal);
      $('#totalCost').val('$' + total);

      //paypal
      paypal.Buttons({
         // Set up the transaction
         createOrder: function(data, actions) {
            return actions.order.create({
               purchase_units: [{
                  amount: {
                     value: total + '',
                     currency_code: 'USD',
                     breakdown: {
                        item_total: {
                           value: priceForPaypal,
                           currency_code: 'USD'
                        },
                        shipping: {
                           value: shipping,
                           currency_code: 'USD'
                        },
                        tax_total: {
                           currency_code: 'USD',
                           value: taxAmount
                        },
                     }
                  },
                  items: [{
                     name: itemName,
                     sku: itemid,
                     unit_amount: {
                        currency_code: "USD",
                        value: priceForPaypal
                     },
                     tax: {
                        currency_code: "USD",
                        value: taxAmount
                     },
                     quantity: "1"
                  }]
               }]
            });
         },

         // Finalize the transaction
         onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
               // after transaction completes
               $('#paypal-button-container').empty();
               $('#afterPurchaseMsg').text(
                  "Thank you for your purchase.  Your item will be shipped within 1-2 business days."
               );
            });
         }

      }).render('#paypal-button-container');
   }

   $('#purchaseModal').modal('show');
}