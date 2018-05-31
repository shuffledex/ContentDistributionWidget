"use strict"

var ContentDistribution = function() {
    LocalContractStorage.defineMapProperty(this, "contentPool");
};

ContentDistribution.prototype = {
    init: function() {},

    saveContent: function(hash, wallet, content, price) {
        if (!hash || !wallet || !content || !price) {
            throw new Error("Params required");
        }
        if (Blockchain.verifyAddress(wallet)) {
            this.contentPool.put(hash, {
                wallet: wallet,
                content: content,
                price: price
            });
            return true;
        }
        return false;
    },

    download: function(hash) {
        if (!hash) {
            throw new Error("Param required");
        }
        var contentPool = this.contentPool.get(hash);
        var wallet = contentPool.wallet;
        if (wallet === undefined) {
            return false;
        }
        var value = new BigNumber(Blockchain.transaction.value);
        var price = new BigNumber(contentPool.price);
        if (!value.eq(price)) {
            throw new Error("Wrong price");
        }
        Blockchain.transfer(wallet, value);
        Event.Trigger("download", {
            Data: {
                from: Blockchain.transaction.from,
                content: contentPool.content
            }
        })
        return contentPool.content
    },

    debug: function(key) {
        return this.contentPool.get(key);
    },

    dummy: function() {
        return true
    }

};

module.exports = ContentDistribution;