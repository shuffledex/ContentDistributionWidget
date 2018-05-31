var serialNumber;
var intervalQuery;
var NebPay = require("nebpay");
var nebPay = new NebPay();
var dappAddress = "n1tXRd7sY5599xVT9nYcDUf544otMjd6xwU";

const endpoint = NebPay.config.mainnetUrl;
//const endpoint = NebPay.config.testnetUrl;

window.onload = function() {     
    if (typeof(webExtensionWallet) === "undefined") {     
        $(".noExtension").show();     
        $(".container").hide();
    }
};

$(document).ready(function() {                 
    nebPay.simulateCall(dappAddress, 0, "dummy", null, { 
        listener: cbSearch
    });
})

$('#price').on('input', function() { 
    $('#widget').find('#nasPrice').html($(this).val())
    if ($(this).val() == "") {
       $('#widget').find('#nasPrice').html("0") 
    }
});

$('#title').on('input', function() { 
    $('#widget').find('.title').html($(this).val())
    if ($(this).val() == "") {
       $('#widget').find('.title').html("Your title will be here...") 
    }
});

$('#introduction').on('input', function() { 
    $('#widget').find('.introduction').html($(this).val())
    if ($(this).val() == "") {
       $('#widget').find('.introduction').html("Your introduction will be here...") 
    }
});

function cbSearch(resp) {
    var result = resp.result;          
    if (result === '') {
        $(".errNetwork").show();
        $(".container").hide();
    }
}

function generateWidget() {
    $('.buttonFlip').hide();
    $('.loading').hide();

    var wallet = $("#wallet").val();
    var website = $("#website").val();
    var content = $("#content").val();
    var price = $("#price").val();
    var title = $("#title").val();
    var introduction = $("#introduction").val();
    
    if (wallet == "" || content == "" || price == "" || title == "" || introduction == "") {
        alert("Please fill in all the options");
        return false;
    }

    var hash = _randomHash(10, '01234567890abcdefghijklmnopqrstsuvxyzABCDEFGHIJKLMNOPQRSTUVXYZ');
    $('#hash').val(hash);

    var callArgs = [];
    callArgs.push(hash);
    callArgs.push(wallet);
    callArgs.push(_encrypt(content));
    callArgs.push(parseFloat(price) * (10 ** 18));
    callArgs = JSON.stringify(callArgs);

    serialNumber = nebPay.call(dappAddress, 0, "saveContent", callArgs, {
        callback: endpoint,
        listener: showScript
    });
    intervalQuery = setInterval(function() {
        intervalQueryFn();
    }, 20000);
}

function intervalQueryFn() {
    nebPay.queryPayInfo(serialNumber, {
        callback: endpoint
    })
    .then(function(response) {
        var respObject = JSON.parse(response)
        console.log("intervalQueryFn", respObject)
        if (respObject.code === 0) {
            clearInterval(intervalQuery);
            $('.buttonFlip').show();
            $('.loading').hide();
            rotateCard($(".flip").first());
            window.scrollTo(0, 0);
            $(":input").prop("disabled", true);
            var script = '<div id="contentDistributionWidget" data-price="' + $("#price").val() + '" data-title="' + $("#title").val() + '" data-introduction="' + $("#introduction").val() + '" data-wallet="' + $('#hash').val() + '"></div><script src="https://shuffledex.github.io/ContentDistributionWidget/party/widget.min.js"></script>' 
            $('#script').val(script);
        } else {}
    })
    .catch(function(err) {
        console.log("err", err)
        clearInterval(intervalQuery);
    });
};

function _encrypt(str) {
    if (!str) str = "";
    str = (str == "undefined" || str == "null") ? "" : str;
    try {
        var key = 146;
        var pos = 0;
        ostr = '';
        while (pos < str.length) {
            ostr = ostr + String.fromCharCode(str.charCodeAt(pos) ^ key);
            pos += 1;
        }
        return ostr;
    } catch (ex) {
        return '';
    }
}

function showScript(response) {
    if (typeof response === "object") {
        $('.loading').show();
    }
    console.log("showScript", response)
}

function _randomHash(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function rotateCard(btn) {
    var $card = $(btn).closest('.card-container');
    if ($card.hasClass('hover')) {
        $card.removeClass('hover');
    } else {
        $card.addClass('hover');
    }
}