var inventoryList;
var currentFilter = "";

function buildInventoryList(jsonlist) {
   var template = $("#inventoryItem").html();
   var itemListWrapperId = '#inventoryListWrapper';
   var items = jsonlist;

   if (items && items.length > 0) {
      items.forEach(buildListItem);
   } else {
      $(itemListWrapperId).removeClass();
      $(itemListWrapperId).html(
         '<div class=\"text-center\"><h4>No items available at this Time.  Check Back Soon!</h4></div>');
   }

   function buildListItem(item, index) {
      var listItem = $(template);

      var listItemTitle = $('#itemid', listItem);
      listItemTitle.text('#' + item.id);

      var listItemTitle = $('#name', listItem);
      listItemTitle.text(item.name);

      var listItemDesc = $('#itemdesc', listItem);
      listItemDesc.text(item.description);

      var listItemAddr = $('#itemprice', listItem);
      listItemAddr.text(item.price);

      var listItemWeb = $('#itemimg', listItem);
      listItemWeb.attr("src", 'https://s3.amazonaws.com/com.shawartsfl/inventory/' + item.id + '.jpg');

      var listItemDate = $('#itemcat', listItem);
      listItemDate.text(item.category);

      var listItemDate = $('#itemsize', listItem);
      listItemDate.text(item.size);

      // setting data
      var listItemWeb = $('#purchaseBtn', listItem);
      listItemWeb.attr("itemid", item.id);
      listItemWeb.attr("itemname", item.name);
      listItemWeb.attr("itemprice", item.price);

      if (index === 0) {
         $(itemListWrapperId).html(listItem);
      } else {
         $(itemListWrapperId).append(listItem);
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
      $('#purchaseItemImage').attr("src", 'https://s3.amazonaws.com/com.shawartsfl/inventory/' + itemid + '.jpg');
   }
   $('#purchaseModal').modal('show'); 
}








