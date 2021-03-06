Ext.ns('afStudio.wd.edit');

/**
 * @mixin EditModelReflector
 *  
 * @singleton
 * @author Nikolai Babinski
 */
afStudio.wd.edit.EditModelReflector = (function() {
	
	return {
	
		/**
		 * Changes the line of some executors. 
		 * @override
		 */
		correctExecutorLine : function(line, type, node, property) {
			if (['Field', 'Description'].indexOf(line) != -1) {
				var pt = this.getExecutorToken(node.parentNode.tag);
				line = pt + line;
			}
			
			return line;
		},
		
		/**
		 * Removes component & unmapping it from the associated model node.
		 * @param {Node} node
		 * @param {Object} cmp
		 */
		removeComponent : function(node, cmp) {
			cmp.destroy(true);
			this.unmapCmpFromModel(node);
		},
		
		//i:description
		//----------------------------------------------------
		
		/**
		 * Adds description.
		 */
		executeAddRootDescription : function() {
			var tbar = this.getTopToolbar();
			tbar.show();		
		},
		/**
		 * Removes description.
		 */
		executeRemoveRootDescription : function() {
			var tbar = this.getTopToolbar(),
				dsc = tbar.getComponent('description');
			dsc.setText('&#160;');
			tbar.hide();
			this.doLayout();
		},
		/**
		 * _content
		 */
		executeUpdateRootDescription_content : function(node, cmp, p, v) {
			var tbar = this.getTopToolbar(),
				dsc = tbar.getComponent('description');
			
			dsc.setText(v.trim() ? v : '&#160;');			
		},
		
		
		//buttons, responsible properties: i:fields, i:actions
		//----------------------------------------------------
		
		//submit & reset buttons
		
		/**
		 * Updates submit button's label 
		 */
		executeUpdateFieldsSubmitlabel : function(node, cmp, p, v) {
			cmp.setText(v);
		},
		/**
		 * Updates reset button's label
		 */
		executeUpdateFieldsResetlabel : function(node, cmp, p, v) {
			cmp.setText(v);
		},
		/**
		 * Submit & Reset buttons visibility state 
		 */
		executeUpdateFieldsSubmit : function(node, cmp, p, v) {
			if (v === false) {
				cmp.sub.hide();
				cmp.res.hide();
			} else {
				cmp.sub.show();
				if (this.getModelByCmp(cmp.res)[1]) {
					cmp.res.show();
				}
			}
			this.doLayout();
		},
		/**
		 * Reset button visibility
		 */
		executeUpdateFieldsResetable : function(node, cmp, p, v) {
			v ? cmp.show() : cmp.hide();
		},
		
		//general buttons
		
		/**
		 * Adds a button.
		 * @private
		 * @param {Node} node The button related node
		 * @param {Number} idx The node idx inside the parent model node
		 * @param {String} type (optional) type The button type, can be "button" | "action", defaults to "button"
		 */
		addButton : function(node, idx, type) {
			type = Ext.isDefined(type) ? type : 'button';	
			
			var fb = this.getFooterToolbar(),
				pBtn = this.getModelNodeProperties(node),
				oBtn = this.createButton(pBtn, type);
				
			idx = this.getButtonIndex(node, idx, type);
			fb.insertButton(idx, oBtn);
			this.doLayout();
		},
		
		/**
		 * @private
		 */
		removeButton : function(node, cmp) {
			this.removeComponent(node, cmp);
		},
		
		/**
		 * @private
		 */
		insertButton : function(parent, node, refNode, refCmp, type) {
			type = Ext.isDefined(type) ? type : 'button';
			
			var fb = this.getFooterToolbar(),
				pBtn = this.getModelNodeProperties(node),
				oBtn = this.createButton(pBtn, type),
				idx = fb.items.indexOf(refCmp);
			
			fb.insertButton(idx, oBtn);			
			this.doLayout();			
		},
		
		/**
		 * Sets button <u>name</u> property.
		 * @private
		 * @param {Object} btn The button whose name property being set
		 * @param {String} v The name value
		 */
		setButtonName : function(btn, v) {
			var oldValue = btn.name;
			btn.name = v;
			if (Ext.isEmpty(btn.text) || btn.text == oldValue) {
				btn.setText(v);
			}
		},
		
		/**
		 * Sets button <u>text</u> property
		 * @private
		 */
		setButtonText : function(btn, v) {
			btn.setText(v ? v : btn.name);
		},
		
		/**
		 * Adds i:fields->i:button
		 */
		executeAddButton : function(node, idx) {
			this.addButton(node, idx);
		},
		/**
		 * Removes i:fields->i:button
		 */
		executeRemoveButton : function(node, cmp) {
			this.removeButton(node, cmp);
		},
		/**
		 * Inserts i:fields->i:button
		 */
		executeInsertButton : function(parent, node, refNode, refCmp) {
			this.insertButton(parent, node, refNode, refCmp);
		},
		/**
		 * label
		 */
		executeUpdateButtonLabel : function(node, cmp, p, v) {
			this.setButtonText(cmp, v);
		},
		/**
		 * name
		 */
		executeUpdateButtonName : function(node, cmp, p, v) {
			this.setButtonName(cmp, v);
		},
		/**
		 * iconCls
		 */		
		executeUpdateButtonIconCls : function(node, cmp, p, v) {
			cmp.setIconClass(v);
		},
		/**
		 * icon
		 */		
		executeUpdateButtonIcon : function(node, cmp, p, v) {
			cmp.setIcon(v);
		},
		
		//i:action buttons
		
		executeAddAction : function(node, idx) {
			this.addButton(node, idx, 'action');
		},
		executeRemoveAction : function(node, cmp) {
			this.removeButton(node, cmp);
		},
		executeInsertAction : function(parent, node, refNode, refCmp) {
			this.insertButton(parent, node, refNode, refCmp, 'action');
		},
		/**
		 * name
		 */
		executeUpdateActionName : function(node, cmp, p, v) {
			this.setButtonName(cmp, v);
		},
		/**
		 * text
		 */
		executeUpdateActionText : function(node, cmp, p, v) {
			this.setButtonText(cmp, v);
		},
		/**
		 * iconCls
		 */		
		executeUpdateActionIconCls : function(node, cmp, p, v) {
			cmp.setIconClass(v);
		},
		/**
		 * icon
		 */		
		executeUpdateActionIcon : function(node, cmp, p, v) {
			cmp.setIcon(v);
		},
		/**
		 * tooltip
		 */
		executeUpdateActionTooltip : function(node, cmp, p, v) {
			cmp.setTooltip(v);	
		},
		
		//i:fields
		//----------------------------------------------------		
		
		//TODO labelWidth property implementation
		executeUpdateFieldsLabelWidth : function(node, cmp, p, v) {
			this.labelWidth = Ext.isEmpty(v) ? 100 : v;
			/*
			console.log('label width', v);
			this.form.applyToFields({labelWidth: v});
			*/
		},
		
		//fields (i:fields->i:field)
		//----------------------------------------------------
		
		/**
		 * Sets field's <u>content</u> property.
		 * @private
		 */
		setFieldContent : function(node, fld, v) {
			var fv = this.getModelNodeProperty(node, 'value');
			fld.content = v;
			fld.setValue(Ext.isEmpty(v) && !Ext.isEmpty(fv) ? fv : v);  
		},
		/**
		 * Sets field's <u>value</u> property.
		 * @private
		 */
		setFieldValue : function(fld, v) {
			if (Ext.isEmpty(fld.content)) {
				fld.setValue(v);
			}
		},

		/**
		 * Relocates field component.
		 * @private
		 * @param {Node} fldNode The field model node
		 * @param {Number} fldPos The field's position
		 */
		relocateField : function(fldNode, fldPos) {
			if (fldNode.nextSibling) {
				var parent = fldNode.parentNode,
					refNode = fldNode.nextSibling,
					refCmp = this.getCmpByModel(refNode);
				this.executeInsertFieldsField(parent, fldNode, refNode, refCmp);
			} else {
				this.executeAddFieldsField(fldNode, fldPos);
			}
		},
		
		/**
		 * Adds field.
		 */
		executeAddFieldsField : function(node, idx) {
			var pField = this.getModelNodeProperties(node);
			
			if (this.isGrouped()) {
				
				var refNode = this.getRefByField(node, true);
				
				if (refNode) {
					var refCmp = this.getCmpByModel(refNode),
						oField = this.createField(pField);
					refCmp.add(oField);
					refCmp.doLayout();
				} else {
					
					var defSet = this.getDefaultSet();
					
					if (defSet) {
						var oField = this.createField(pField);
						defSet.add(oField);
						this.updateDefaultSetVisibility();
						defSet.doLayout();
					} else {
						defSet = this.createDefaultFieldSet([pField]);
						var tabPanel = this.getTabbedSet();
						if (tabPanel) {
							this.insert(this.items.indexOf(tabPanel), defSet);
						} else {
							this.add(defSet);
						}
						this.doLayout();
					}
				}
				
			} else {
				var oField = this.createField(pField),
					fldIdx = this.getFieldIndex(node, idx);
				this.insert(fldIdx, oField);
				this.doLayout();
			}
		},
		//eo executeAddFieldsField

		/**
		 * Removes field.
		 */
		executeRemoveFieldsField : function(node, cmp) {
				cmp.destroy();
		},
		
		/**
		 * Inserts field.
		 */
		executeInsertFieldsField : function(parent, node, refNode, refCmp) {
			var pField = this.getModelNodeProperties(node);
			
			//widget has grouping sets 	
			if (this.isGrouped()) {
				var ref = this.getRefByField(node, true);
				
				//if the i:ref node exists, mapped to the field being inserted  
				if (ref) {
					var oField = this.createField(pField);
					refCmp = this.getCmpByModel(ref);
					refCmp.add(oField);
					refCmp.doLayout();
					
				//field will be inserted in default fields-set
				} else {
					var defSet = this.getDefaultSet();
					
					if (defSet) {
						var oField = this.createField(pField);
						
						if (!node.isSimilarNode(refNode)) {
							defSet.add(oField);
						} else {
							var fldIdx = defSet.items.indexOf(refCmp);
							if (fldIdx == -1) {
								fldIdx = this.getDefaultSetInsertFieldIndex(parent, refNode);
							}
							defSet.insert(fldIdx, oField);
						}
						this.updateDefaultSetVisibility();
						defSet.doLayout();
						
					//default fields-set is not exists and will be created	
					} else {
						defSet = this.createDefaultFieldSet([pField]);
						var tabPanel = this.getTabbedSet();
						if (tabPanel) {
							this.insert(this.items.indexOf(tabPanel), defSet);
						} else {
							this.add(defSet);
						}
						this.doLayout();
					}
				}
				
			//simple edit widget
			} else {
				var oField = this.createField(pField);
				
				if (!node.isSimilarNode(refNode)) {
					this.add(oField);
				} else {
					var fldIdx = this.items.indexOf(refCmp);
					this.insert(fldIdx, oField);
				}
				this.doLayout();
			}
		},
		//eo executeInsertFieldsField
		
		/**
		 * type
		 */
		executeUpdateFieldsFieldType : function(node, cmp, p, v) {
			if (this.isGrouped()) {
				var defSet = this.getDefaultSet();

				//field is inside the default fields-set
				if (defSet && defSet.items.indexOf(cmp) != -1) {
					var fldIdx = defSet.items.indexOf(cmp);
					defSet.remove(cmp, true);
					this.relocateField(node, fldIdx);
					
				//not default fields-set	
				} else {
					var fldCt = cmp.ownerCt;
					fldCt.removeAll(true);
					this.executeAddFieldsField(node);
				}
			
			//simple(not grouped) edit widget
			} else {
				var fldIdx = this.items.indexOf(cmp);
				this.remove(cmp, true);
				this.executeAddFieldsField(node, fldIdx);
			}
		},
		/**
		 * label
		 */
		executeUpdateFieldsFieldLabel : function(node, cmp, p, v) {
			if (cmp.label) {
				cmp.label.update(!Ext.isEmpty(v) ? (v + ':') : v);
			}
		},
		/**
		 * content
		 */
		executeUpdateFieldsFieldContent : function(node, cmp, p, v) {
			this.setFieldContent(node, cmp, v);
		},
		/**
		 * value
		 */
		executeUpdateFieldsFieldValue : function(node, cmp, p, v) {
			this.setFieldValue(cmp, v);
		},
		/**
		 * disabled
		 */
		executeUpdateFieldsFieldDisabled : function(node, cmp, p, v) {
			v == true ? cmp.disable() : cmp.enable();
		},
		/**
		 * height
		 */
		executeUpdateFieldsFieldHeight : function(node, cmp, p, v) {
			cmp.setHeight(v);

			//Ext.ux.Multiselect fix
			if (cmp.getXType() == 'multiselect') {
				Ext.getCmp(cmp.el.child('fieldset').id).setHeight(v);
			}
		},
		/**
		 * width
		 */
		executeUpdateFieldsFieldWidth : function(node, cmp, p, v) {
			cmp.setWidth(v);

			//Ext.ux.Multiselect fix
			if (cmp.getXType() == 'multiselect') {
				Ext.getCmp(cmp.el.child('fieldset').id).setWidth(v);
			}
		},
		/**
		 * style
		 */
		executeUpdateFieldsFieldStyle : function(node, cmp, p, v) {
			var stl = cmp.el.getStyles('width', 'height');
			cmp.el.dom.removeAttribute('style', '');
			cmp.el.applyStyles(stl).applyStyles(v);
		},
		/**
		 * state
		 */
		executeUpdateFieldsFieldState : function(node, cmp, p, v) {
			switch (v) {
				case 'editable':
					cmp.enable();
					cmp.setReadOnly(false);
					break;
				case 'readonly':
					cmp.enable();
					cmp.setReadOnly(true);
					break;
				case 'disabled':
					cmp.disable();
					break;
			}
		},
		/**
		 * checked
		 */
		executeUpdateFieldsFieldChecked : function(node, cmp, p, v) {
			if (['checkbox', 'radio'].indexOf(cmp.getXType()) != -1) {
				cmp.setValue(v);
			}
		},
		/**
		 * rich
		 */
		executeUpdateFieldsFieldRich : function(node, cmp, p, v) {
			if (cmp.getXType() == 'textarea') {
				this.executeUpdateFieldsFieldType(node, cmp, p, v);
			}
		},
		/**
		 * dateFormat
		 */
		executeUpdateFieldsFieldDateFormat : function(node, cmp, p, v) {
			var type = cmp.getXType();
			
			if (['datefield', 'xdatetime'].indexOf(type) != -1) {
				
				if (type == 'xdatetime') {
					cmp.df.format = v;	
				} else {
					cmp.format = v;
				}
			}
		},
		/**
		 * timeFormat
		 */
		executeUpdateFieldsFieldTimeFormat : function(node, cmp, p, v) {
			if (cmp.getXType() == 'xdatetime') {
				//TODO implement
				//cmp.tf.format = v;
			}
		},
		
		//i:grouping, i:set
		//----------------------------------------------------
		
		/**
		 * Sets field-set title.
		 * @private
		 * @param {Ext.form.FieldSet} fs The field set which title being updated
		 * @param {String} title The title
		 */
		changeFieldSetTitle : function(fs, title) {
			fs.setTitle(title ? title : '&#160;');
		},
		
		/**
		 * Adds grouping (i:grouping node).
		 */
		executeAddGrouping : function(node, idx) {
			this.removeAll(true);
			
			var flds = this.getFields(),
				defSet = this.createDefaultFieldSet(flds);
				
			this.add(defSet);
			this.doLayout();
		},
		/**
		 * Removes grouping (i:grouping node).
		 * Widget is not grouped anymore => fields must be relocated.
		 */
		executeRemoveGrouping : function(node, cmp) {
			var fsNode = this.getModelNode(this.NODES.FIELDS),
				fields = this.getFields();
			
			//clean widget
			this.removeAll(true);
			
			Ext.each(fields, function(fld) {
				var oField = this.createField(fld),
					fn = this.getModelNode(fld[this.NODE_ID_MAPPER]),
					fnPos = fsNode.indexOf(fn),
					fldIdx = this.getFieldIndex(fn, fnPos);
					
				this.insert(fldIdx, oField);
			}, this);
		
			this.doLayout();
		},
		
		/**
		 * collapsed
		 */
		executeUpdateGroupingCollapsed : function(node, cmp, p, v) {
			var ds = this.getDefaultSet();
			
			v == true ? ds.collapse() : ds.expand();
		},
		/**
		 * title
		 */
		executeUpdateGroupingTitle : function(node, cmp, p, v) {
			var ds = this.getDefaultSet();
			this.changeFieldSetTitle(ds, v);
		},
		
		/**
		 * Adds fields-set.
		 */
		executeAddSet : function(node, idx) {
			var pSet = this.getModelNodeProperties(node),
				tabPanel = this.getTabbedSet();
			
			//fields-set is tabbed
			if (this.isSetTabbed(node)) {
				if (tabPanel) {
					var tab = this.createTab(pSet);
					tabPanel.add(tab);
					tabPanel.doLayout();
				//tab panel is not defined
				} else {
					tabPanel = this.createTabPanel([pSet]);
					this.add(tabPanel);
					this.doLayout();
				}
				
			//plain fields-set	
			} else {
				//view has tabbed fields-set(s)
				if (tabPanel) {
					var tabPanelIdx = this.items.indexOf(tabPanel);
					idx = this.getDefaultSet() ? tabPanelIdx - 1 : tabPanelIdx; 
				}
				var oSet = this.createFieldSet(pSet);
				this.insert(idx, oSet);
				this.doLayout();
			}
		},
		//eo executeAddSet
		
		/**
		 * Removes fields-set.
		 */
		executeRemoveSet : function(node, cmp) {
			var fieldsCmp = cmp.findByType('field'),
				fsNode = this.getModelNode(this.NODES.FIELDS),
				fields = []; //fields nodes from being removed fields-set
				
			//fetched field-sets fields nodes and thier positions	
			Ext.each(fieldsCmp, function(fld){
				var fn = this.getModelNode(fld[this.NODE_ID_MAPPER]),
					fnPos = fsNode.indexOf(fn);
				fields.push({field: fn, pos: fnPos});
			}, this);
			
			//removes fields-set
			if (this.isSetTabbed(node)) {
				var tabPanel = this.getTabbedSet();
				
				//remove tabbed fields-set
				cmp.ownerCt.destroy();
				
				//there are no tabbed fields-set(s) - remove tabpanel
				if (tabPanel.items.getCount() == 0) {
					tabPanel.destroy();
				}
			} else {
				cmp.destroy();
			}
			
			//field-set contains fields which must be relocated
			Ext.each(fields, function(f) {
				this.relocateField(f.field, f.pos);	
			}, this);
		},
		//eo executeRemoveSet
		
		/**
		 * Inserts fields-set.
		 */
		executeInsertSet : function(parent, node, refNode, refCmp) {
			var tabPanel = this.getTabbedSet(),
				pSet = this.getModelNodeProperties(node),
				idx = this.getFieldSetInsertionIndex(parent, node, refNode, refCmp);
			
			//fields-set is tabbed
			if (this.isSetTabbed(node)) {
				if (tabPanel) {
					var oTab = this.createTab(pSet);
					tabPanel.insert(idx, oTab);
					tabPanel.doLayout();
				//tab panel is not defined
				} else {
					tabPanel = this.createTabPanel([pSet]);
					this.add(tabPanel);
					this.doLayout();
				}
				
			//insert fields-set in specified position	
			} else {
				var oSet = this.createFieldSet(pSet),
					idx = this.getFieldSetInsertionIndex(parent, node, refNode, refCmp);
				this.insert(idx, oSet);
				this.doLayout();
			}
		},
		//eo executeInsertSet
		
		/**
		 * Relocates fields-set component.
		 * @private
		 * @param {Node} node The fields-set (i:set) model node 
		 */
		relocateFieldSet : function(node) {
			var grNode = node.parentNode,
				refNode = node.nextSibling;
			
			//recreate fields-set and injected into the widget
			if (refNode) {
				var refCmp = this.getCmpByModel(refNode);
				this.executeInsertSet(grNode, node, refNode, refCmp);
			} else {
				var idx = grNode.indexOf(node);
				this.executeAddSet(node, idx);
			}			
		},
		
		/**
		 * title
		 */
		executeUpdateSetTitle : function(node, cmp, p, v) {
			this.changeFieldSetTitle(cmp, v);
		},
		/**
		 * collapsed
		 */
		executeUpdateSetCollapsed : function(node, cmp, p, v) {
			v == true ? cmp.collapse() : cmp.expand();			
		},
		/**
		 * float
		 */
		executeUpdateSetFloat : function(node, cmp, p, v) {
			this.isSetTabbed(node) ? cmp.ownerCt.destroy() : cmp.destroy();
			this.relocateFieldSet(node);
		},
		/**
		 * tabtitle
		 */
		executeUpdateSetTabtitle : function(node, cmp, p, v, oldValue) {
			//tabbed fields-set
			if (!Ext.isEmpty(v)) {
				if (!Ext.isEmpty(oldValue)) {
					cmp.ownerCt.setTitle(v);
				} else {
					cmp.destroy();
					this.relocateFieldSet(node);
				}
			} else {
				//if there are no tabbed sets - remove tab panel
				if (Ext.isEmpty(this.getTabbedFieldSets())) {
					var tabPanel = this.getTabbedSet();
					tabPanel.destroy();
				} else {
					cmp.ownerCt.destroy();
				}
				
				this.relocateFieldSet(node);
			}
		},
		
		//i:ref
		//----------------------------------------------------

		/**
		 * Creates reference's field component, the field node 
		 * associated with reference via its "to" property.
		 * @private
		 * @param {Node} refNode The reference node, i:ref
		 * @return {Ext.form.Field} field   
		 */
		createRefField : function(refNode) {
			var fld = null,
				toValue = refNode.getPropertyValue('to'); 
			
			if (toValue) {
				fld = this.getField(toValue);
				
				if (!Ext.isEmpty(fld)) {
					fld = this.createField(fld);
				}
			}

			return fld;
		},
		
		/**
		 * Updates the column width of floating references.
		 * @private
		 * @param {Ext.Container} refWrapper The floating reference container
		 */
		updateFloatingRefWidth : function(refWrapper) {
			var count = refWrapper.items.getCount(),
				clmWidth = Ext.util.Format.round(1 / count, 2);

			refWrapper.items.each(function(ref, idx){
				ref.columnWidth = clmWidth;
			});
		},
		
		/**
		 * Removes reference component from widget and makes all needed updates.
		 * Important - this method doesn't do anything for ref's field relocation.
		 * @private
		 * @param {Node} refNode The reference model node
		 * @param {Ext.Container} cmp The reference contsiner component
		 * @param {Boolean} (optional) refBreak The reference "break" property to use instead of reference node's real value,
		 * by default it is undefined and the real "break" property of i:ref node is used 
		 */
		removeReferenceCmp : function(refNode, cmp, refBreak) {
			var	refBreak = Ext.isDefined(refBreak) ? refBreak : refNode.getPropertyValue('break'),
				prevRefNode = refNode.previousSibling,
				nextRefNode = refNode.nextSibling,
				cmp = cmp ? cmp : this.getCmpByModel(refNode),
				refWrapper = cmp.ownerCt;
			
			cmp.destroy();
			
			//relocate references
			if (refBreak && nextRefNode && prevRefNode 
				&& !prevRefNode.getPropertyValue('break')) {
					
				this.relocateRefsUp(refNode, refWrapper);
				
			//updates reference wrapper after fields-set removal
			} else {
				this.updateFloatingRefWidth(refWrapper);
				refWrapper.doLayout();
			}
		},
		
		/**
		 * Relocates refs down.
		 * @private
		 * @param {Node} refNode 
		 */
		relocateRefsDown : function(refNode) {
			var setNode = refNode.parentNode,
				setCmp = this.getCmpByModel(setNode),
				isSetFloat = setNode.getPropertyValue('float'),
				prevRefNode = refNode.previousSibling,
				nextRefNode = refNode.nextSibling;
			
			//remove refs being relocated	
			var node = nextRefNode;
			while (node) {
				this.getCmpByModel(node).destroy();
				if (node.getPropertyValue('break')) break;
				node = node.nextSibling;
			}
			var refWrapper = this.getCmpByModel(prevRefNode).ownerCt;
			this.updateFloatingRefWidth(refWrapper);
			
			//refs relocation
			var wr = this.createRefWrapper(isSetFloat);
			while (nextRefNode) {
				var f = this.createRefField(nextRefNode),
					r = this.getModelNodeProperties(nextRefNode);
					
				this.wrapField(wr, f, r);
				if (nextRefNode.getPropertyValue('break')) break;
				nextRefNode = nextRefNode.nextSibling;
			}
			this.updateFloatingRefWidth(wr);
			
			var wrPos = setCmp.items.indexOf(refWrapper) + 1;
			setCmp.insert(wrPos, wr);
			setCmp.doLayout();
		},
		
		/**
		 * Relocates refs up.
		 * @private
		 * @param {Node} refNode The start point for relocation
		 * @param {Ext.Container} refWrapper The reference container object 
		 */
		relocateRefsUp : function(refNode, refWrapper) {
			var	setNode = refNode.parentNode,
				setCmp = this.getCmpByModel(setNode),
				prevRefNode = refNode.previousSibling,
				nextRefNode = refNode.nextSibling;
			
			//remove refs being relocated
			var wr = this.getCmpByModel(nextRefNode).ownerCt,
				node = nextRefNode;
			while (node) {
				this.getCmpByModel(node).destroy();
				if (node.getPropertyValue('break')) break;
				node = node.nextSibling;
			}
			wr.destroy();

			//refs relocation
			while (nextRefNode) {
				var f = this.createRefField(nextRefNode),
					r = this.getModelNodeProperties(nextRefNode);
					
				this.wrapField(refWrapper, f, r);
				if (nextRefNode.getPropertyValue('break')) break;
				nextRefNode = nextRefNode.nextSibling;
			}
			
			this.updateFloatingRefWidth(refWrapper);
			
			setCmp.doLayout();
		},
		
		/**
		 * Inserts reference at specified position.
		 * @private
		 * @param {Node} refNode The reference node being inserted
		 * @param {Number} refIdx The reference node's insertion position
		 */
		insertRefNode : function(refNode, refIdx) {
			var setNode = refNode.parentNode,
				setCmp = this.getCmpByModel(setNode),
				isSetFloat = setNode.getPropertyValue('float'),
				prevRefNode = refNode.previousSibling,
				nextRefNode = refNode.nextSibling,
				ref = this.getModelNodeProperties(refNode),
				fld = this.createRefField(refNode);
			
			var me = this,
			
				insertRefWrapper = function(idx) {
					if (!isSetFloat && setCmp.items.getCount() != 0) {
						var refWrapper = setCmp.items.itemAt(0);
						me.wrapField(refWrapper, fld, ref, 1, idx);
						refWrapper.doLayout();
					} else {
						var refWrapper = me.createRefWrapper(isSetFloat);
						me.wrapField(refWrapper, fld, ref);
						setCmp.insert(idx, refWrapper);
						setCmp.doLayout();
					}
				},
				
				insertRef = function(rn, pos, inc) {
					var refCmp = me.getCmpByModel(rn),
						refWrapper = refCmp.ownerCt;
					
					if (Ext.isEmpty(pos)) {
						pos = refWrapper.items.indexOf(refCmp);
						pos = Ext.isDefined(inc) ? pos + inc : pos;
					}
						
					me.wrapField(refWrapper, fld, ref, null, pos);
					me.updateFloatingRefWidth(refWrapper);
					refWrapper.doLayout();
				};
				
			//field-set is float	
			if (isSetFloat) {
				
				if (prevRefNode) {
					if (prevRefNode.getPropertyValue('break')) {
						if (ref['break'] || !nextRefNode) {
							refIdx = setCmp.items.indexOf(this.getCmpByModel(prevRefNode).ownerCt) + 1;
							insertRefWrapper(refIdx);
						} else {
							insertRef(nextRefNode, 0);
						}
					
					//previous reference is float
					} else {
						if (ref['break']) {
							insertRef(prevRefNode, null, 1);
							if (nextRefNode) {
								this.relocateRefsDown(refNode);
							}
						} else {
							insertRef(prevRefNode, null, 1);
						}
					}
				
				//inserted node has no previous reference sibling	
				} else {
					if (ref['break'] || !nextRefNode) {
						insertRefWrapper(0);
					} else {
						insertRef(nextRefNode);
					}
				}

			//field-set is not float	
			} else {
				insertRefWrapper(refIdx);
			}
		},
		//eo insertRefNode
		
		/**
		 * Adds reference node.
		 */
		executeAddRef : function(node, idx) {
			this.insertRefNode(node, idx);
		},
		/**
		 * Inserts reference node.
		 */
		executeInsertRef : function(setNode, node, refNode, refCmp) {
			this.insertRefNode(node, setNode.indexOf(node));			
		},
		
		/**
		 * Removes reference node.
		 */
		executeRemoveRef : function(refNode, cmp) {
			var	ref = this.getModelNodeProperties(refNode),
				fldName = this.getModelNodeProperty(refNode, 'to'),
				fsNode = this.getModelNode(this.NODES.FIELDS),
				prevRefNode = refNode.previousSibling,
				nextRefNode = refNode.nextSibling,
				setNode = refNode.parentNode,
				setCmp = this.getCmpByModel(setNode),
				refWrapper = cmp.ownerCt;
			
			//remove reference wrapper
			if (!cmp.nextSibling() && !cmp.previousSibling()) {
				refWrapper.destroy();
			} else {
				this.removeReferenceCmp(refNode, cmp);
			}

			//if the field node (reference's field - "to" property) exists then relocate it 
			if (!Ext.isEmpty(fldName) && this.getField(fldName)) {
				var nodeId = this.getField(fldName)[this.NODE_ID_MAPPER],
					fldNode = this.getModelNode(nodeId),
					fldIdx = this.getDefaultSetInsertFieldIndex(fsNode, fldNode);
					
				this.relocateField(fldNode, fldIdx);
			}
		},
		//eo executeRemoveRef
		
		/**
		 * to
		 */
		executeUpdateRefTo : function(node, cmp, p, v, oldValue) {
			var fldNode;
			
			if (Ext.isEmpty(v)) {
				fldNode = this.getField(oldValue, true);
				if (fldNode) {
					this.relocateField(fldNode);
				}
				
				return;
				
			}
				
			fldNode = this.getField(v, true);
				
			//relocating previous associated with reference field
			if (this.getField(oldValue, true)) {
				this.relocateField(this.getField(oldValue, true));
			}
			
			//set up new reference field
			this.relocateField(fldNode);
		},
		
		/**
		 * break
		 */
		executeUpdateRefBreak : function(node, cmp, p, v, oldValue) {
			var gr = node.parentNode;
			
			if (gr.getPropertyValue('float') === true) {
				if (v === true) {
					this.removeReferenceCmp(node, cmp, oldValue);
					this.insertRefNode(node, gr.indexOf(node));
				} else {
					this.relocateRefsUp(node, cmp.ownerCt);
				}
			}
		}
	};
})();

/**
 * Extends base mixin {@link afStudio.view.ModelReflector}
 */
Ext.applyIf(afStudio.wd.edit.EditModelReflector, afStudio.view.ModelReflector);