Ext.ns('afStudio.wd.edit');

/**
 * @mixin EditModelInterface
 *  
 * @singleton
 * @author Nikolai Babinski
 */
afStudio.wd.edit.EditModelInterface = (function() {
	
	return {
	
		/**
		 * Checks if the view is grouped: has i:grouping node. 
		 */
		isGrouped : function() {
			var setNode = this.getModelNodeByPath(this.NODES.GROUPING);
			
			return setNode ? true : false;
		},
		
		/**
		 * Returns array of field(s) (i:fields->i:field) properties.
		 * @param {Array|Object|Function} (optional) filter The fields filter, details {@link afStudio.wd.ModelInterface#getModelChildrenProperties}
		 * @return {Array} fields
		 */
		getFields : function(filter) {
			return this.getModelChildrenProperties(this.NODES.FIELDS, this.NODES.FIELD, filter);
		},

		/**
		 * Returns field properties/field node.
		 * @param {String} fldName The field unique name
		 * @param {Boolean} (optional) asNode Flag being true means field should be returned as node 
		 * otherwise as properties object, by default is false 
		 * @return {Object|Node} field properties|node or null if field was not found
		 */
		getField : function(fldName, asNode) {
			var fld = this.getFields({name: fldName})[0];
		
			if (!fld) {
				return null;
			}

			return asNode === true ? this.getModelNode(fld[this.NODE_ID_MAPPER]) : fld;
		},
		
		/**
		 * Returns array of i:fields->i:button properties.
		 * @return {Array} buttons
		 */
		getFieldsButtons : function() {
			return this.getModelChildrenProperties(this.NODES.FIELDS, this.NODES.BUTTON);
		},
		
		/**
		 * Returns field-sets (i:grouping->i:set) properties.
		 * @param {Array|Object|Function} (optional) filter The field-sets filter, details {@link afStudio.wd.ModelInterface#getModelChildrenProperties} 
		 * @return {Array} field-sets
		 */
		getFieldSets : function(filter) {
			return this.getModelChildrenProperties(this.NODES.GROUPING, this.NODES.SET, filter);
		},
		
		/**
		 * Returns fields-sets with not empty "tabtitle" property.
		 * @return {Array} field-sets
		 */
		getTabbedFieldSets : function() {
			return this.getFieldSets(['tabtitle']);
		},
		
		/**
		 * Returns fields-sets with empty "tabtitle" property.
		 * @return {Array} field-sets
		 */
		getPlainFieldSets : function() {
			return this.getFieldSets(function(prop){
				return Ext.isEmpty(prop.tabtitle);
			});				
		},
		
		/**
		 * Checks if fields-set is tabbed ("tabtitle" property is not empty).
		 * @param {String|Node} fldSet The fields-set model id or the model node object
		 * @return {Boolean}
		 */
		isSetTabbed : function(fldSet) {
			return this.isModelStatus(fldSet, function(n){
				return Ext.isEmpty(n.getPropertyValue('tabtitle')) ? false : true;
			});
		},
		
		/**
		 * Returns references properties from a field-set.
		 * @param {String|Node} fldSet The field-set node or it's id
		 * @return {Array} references
		 */
		getRefsFromSet : function(fldSet, filter) {
			return  this.getModelChildrenProperties(fldSet, this.NODES.REF, filter);
		},
		
		/**
		 * Returns references and fields properties from a fields-set.
		 * @param {String|Node} setNode The field-set node or it's id
		 * @return {Array} references & fields definitions:
		 *  [
		 *    "ref" - i:ref definition object,
		 *    "field" - i:field definition object mapped to i:ref->to property
		 *  ]
		 */
		getFieldsFromSet : function(setNode) {
			var refNodes = this.getRefsFromSet(setNode),
				fields = [];
			
			Ext.each(refNodes, function(ref){
				var fs = this.getFields({name: ref.to});
				fields.push({ref: ref, field: fs[0]});
			}, this);
			
			return fields;
		},
		
		/**
		 * Returns fields definition from the default field-set.
		 * @return {Array} fields
		 */
		getFieldsFromDefaultSet : function() {
			var nodeIdMpr = this.NODE_ID_MAPPER;
			
			var fldSets = this.getFieldSets(),
				fieldsInSets = [],
				defFields = [];
			
			Ext.each(fldSets, function(fs){
				var refs = this.getFieldsFromSet(fs[nodeIdMpr]);
				Ext.each(refs, function(ref){
					fieldsInSets.push(ref.field.name);
				});
			}, this);

			var fields = this.getFields();
			Ext.each(fields, function(f){
				if (fieldsInSets.indexOf(f.name) == -1) {
					defFields.push(f);
				}
			});
			
			return defFields;
		},
		
		/**
		 * Returns field index inside the default field-set or null if field doesn't exits in default field-set.
		 * @param {Node|Object} fld The field node or field node's properties object
		 * @return {Number} index or null 
		 */
		getDefaultSetFieldIndex : function(fld) {
			var nodeIdMpr = this.NODE_ID_MAPPER,
				fs = this.getFieldsFromDefaultSet();
			
			var pos = Ext.each(fs, function(f){
				return f[nodeIdMpr] == fld[nodeIdMpr] ? false : true;
			});
			
			return Ext.isDefined(pos) ? pos : null;
		},
		
		/**
		 * Returns i:ref node or its properties by field node.
		 * If the reference node wasn't found by a field returns null.
		 * @param {String|Node} fld The field's name property or field node
		 * @param {Boolean} (optional) asNode Flag if set to true returns i:ref node otherwise its properties, defaults to false
		 * @return {Object} i:ref or null
		 */
		getRefByField : function(fld, asNode) {
			if (!Ext.isString(fld) && !(fld instanceof afStudio.model.Node)) {
				throw new Ext.Error('afStudio.wd.edit.EditModelInterface, getRefByField() parameter "fld" is not correct.' +
					'Accepts "String" as field name and "afStudio.model.Node" as field node');
			}
			
			var nodeIdMpr = this.NODE_ID_MAPPER,
				fldName = Ext.isString(fld) ? fld : fld.getPropertyValue('name'),
				ref = null;
				
			if (Ext.isEmpty(fldName)) {
				return null;
			}
			
			var sets = this.getFieldSets();
			
			Ext.each(sets, function(s){
				var r = this.getRefsFromSet(s[nodeIdMpr], {to: fldName});
				
				if (!Ext.isEmpty(r)) {
					ref = (asNode === true) ? this.getModelNode(r[0][nodeIdMpr]) : r[0];
					return false;
				}
			}, this);
			
			return ref;
		}		
	};
})();

/**
 * Extends base mixin {@link afStudio.wd.ModelInterface} class.
 */
Ext.apply(afStudio.wd.edit.EditModelInterface, afStudio.wd.ModelInterface);