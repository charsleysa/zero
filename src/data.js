//     Zero.js
//     (c) 2013 Stefan Andres Charsley
//     Zero.js may be freely distributed under the MIT license.

// The following code is heavily inspired by jQuery's $.fn.data()

;(function($) {
    var dataAttr = $.fn.data, camelize = $.camelCase,
        exp = $.expando = 'Zero' + (+new Date())

    // Get value from node:
    // 1. first try key as given,
    // 2. then try camelized key,
    // 3. fall back to reading "data-*" attribute.
    function getData(node, name) {
        var store = exp && node[exp]
        if (name === undefined) return store || setData(node)
        else {
            if (store) {
                if (name in store) return store[name]
                var camelName = camelize(name)
                if (camelName in store) return store[camelName]
            }
            return dataAttr.call($(node), name)
        }
    }

    // Store value under camelized key on node
    function setData(node, name, value) {
        var store = node[exp] || (node[exp] = attributeData(node))
        if (name !== undefined) store[camelize(name)] = value
        return store
    }

    // Read all "data-*" attributes from a node
    function attributeData(node) {
        var store = {}
        $.each(node.attributes, function(i, attr){
            if (attr.name.indexOf('data-') == 0)
                store[camelize(attr.name.replace('data-', ''))] =
                    $.deserializeValue(attr.value)
        })
        return store
    }

    $.fn.data = function(name, value) {
        return value === undefined ?
            // set multiple values via object
            $.isPlainObject(name) ?
                this.each(function(i, node){
                    $.each(name, function(key, value){ setData(node, key, value) })
                }) :
                // get value from first element
                this.length == 0 ? undefined : getData(this.get(0), name) :
            // set value on all elements
            this.each(function(){ setData(this, name, value) })
    }

    $.fn.removeData = function(names) {
        if (typeof names == 'string') names = names.split(/\s+/)
        return this.each(function(){
            var store = exp && this[exp]
            if (store) $.each(names || store, function(key){
                delete store[names ? camelize(this) : key]
            })
        })
    }
})(Zero)
