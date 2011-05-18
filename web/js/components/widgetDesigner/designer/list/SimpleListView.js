Ext.ns('afStudio.wd.list');

/**
 * SimpleListView
 * 
 * @class afStudio.wd.list.SimpleListView
 * @extends Ext.grid.GridPanel
 * @author Nikolai
 */
afStudio.wd.list.SimpleListView = Ext.extend(Ext.grid.GridPanel, {	
	/**
	 * @cfg {Object} viewMeta
	 * View metadata object.
	 */
	
	/**
	 * @cfg {String} columnName (defaults to "NewColumn")
	 * Default column name text. 
	 */
	columnName : 'newcolumn'	
	
	/**
	 * @cfg {Number} columnWidth (defaults to 80)
	 * Default column width.
	 */
	,columnWidth : 80
	
	/**
	 * @cfg {Number} maxColumns (defaults to 20)
	 * The number of maximum columns the view can handle. 
	 */
	,maxColumns : 30
	
	/**
	 * Initializes component
	 * @private
	 * @return {Object} The configuration object 
	 */
	,_beforeInitComponent : function() {
		var _this = this,
			   vm = this.viewMeta,
		  columns = [];
		
		//<i:column>
		//TODO resolve issue with column's fixed conf. property
		if (!Ext.isEmpty(vm['i:fields']) && vm['i:fields']['i:column']) {
			var clm = vm['i:fields']['i:column'];			
			
			if (Ext.isArray(clm)) {
				for (var i = 0; i < clm.length; i++) {
					var c = clm[i];
					columns.push({
						header:   c.label,
						name:     c.name,
						width:    c.width ? c.width : this.columnWidth,
						hidden:   c.hidden ? c.hidden.bool() : false,
						hideable: c.hideable ? c.hideable.bool() : true
//						fixed:    c.resizable ? !c.resizable.bool() : true
					});
				}
				for (var i = columns.length - 1; i < this.maxColumns; i++) {
					columns.push({
						header: this.columnName,
						width: this.columnWidth,
						hidden: true,
//						fixed: true,
						uninit: true
					});
				}
				
			} else {
				columns.push({
					header:    clm.label,
					name:      clm.name,
					width:     clm.width ? clm.width : this.columnWidth,
					hidden:    clm.hidden ? clm.hidden.bool() : false,
					hideable:  clm.hideable ? clm.hideable.bool() : true
//					fixed:     clm.resizable ? !clm.resizable.bool() : true					
				});				
				for (var i = 1; i < this.maxColumns; i++) {
					columns.push({
						header: this.columnName,
						width: this.columnWidth,
						hidden: true,
//						fixed: true,
						uninit: true
					});
				}
			}
		}
		
		//<i:fields>[select]
		var sm = new Ext.grid.RowSelectionModel();
		if (!Ext.isEmpty(vm['i:fields']) && vm['i:fields'].select && vm['i:fields'].select.bool()) {
			sm = new Ext.grid.CheckboxSelectionModel();
			columns.unshift(sm);
		}
		
		//<i:rowactions>
		if (!Ext.isEmpty(vm['i:rowactions']) && vm['i:rowactions']['i:action']) {			
			var actionClm = this.createRowActionColumn(vm['i:rowactions']['i:action']);
			columns.push(actionClm);
		}
		//eo <i:column>

		var store = new Ext.data.ArrayStore({
			idIndex: 0,
			data: [[]],
			fields: []
		});
		
		//<i:actions>
		var iActions = {	        	
    		itemId: 'actions',
        	items: [        	
        	'->',
        	{
        		itemId: 'expanded-view',
        		text: 'Expanded View',
        		iconCls: 'icon-application-split'
        	},{
        		itemId: 'more',
    			text: 'More Actions',
				menu: {
					items: [
					{
						itemId: 'exports',
						text: 'Exports',
						iconCls: 'icon-database-save'
					},{
						itemId: 'sel-all',
						text: 'Select All'
					},{
						itemId: 'desel-all',
						text: 'Deselect All'
					}]
				}        			
        	}]
		};		
		
		//<i:description>
		var iDescription = {
    		itemId: 'desc',
    		hidden: true,
        	items: {
        		xtype: 'tbtext',
        		style: 'white-space: normal;',
        		text: ''
        	}
		};
		if (vm['i:description'] && !Ext.isEmpty(Ext.util.Format.trim(vm['i:description']))) {
			iDescription.hidden = false;			
			iDescription.items.text = vm['i:description'];			
		}
		
		return {
			title: vm['i:title'],
	        store: store,
	        selModel: sm,
			columns: columns,
	        view: new afStudio.wd.list.ListGridView(),
	        columnLines: true,
	        tbar: {
	        	xtype: 'container',
	        	defaults: {
	        		xtype: 'toolbar'
	        	},
	        	items: [iActions, iDescription]
	        },
	        bbar: {
	        	xtype: 'paging',
	        	hidden: Ext.isDefined(vm['i:fields'].pager) ? !(vm['i:fields'].pager.bool()) : false,
		        store: store,
		        displayInfo: true
	        }
		};		
	}//eo _beforeInitComponent	
	
	/**
	 * ExtJS template method
	 * @private
	 */
	,initComponent : function() {
		Ext.apply(this, 
			Ext.apply(this.initialConfig, this._beforeInitComponent())
		);		
		afStudio.wd.list.SimpleListView.superclass.initComponent.apply(this, arguments);
		this._afterInitComponent();
	}//eo initComponent
	
	/**
	 * Initializes events & does post configuration
	 * @private
	 */	
	,_afterInitComponent : function() {
		var _this = this;		
		
		this.configureView();
		
		this.addEvents(
			/**
			 * @event 'changeColumnPosition' Fires when a column was moved from his previous position.
			 * @param {Ext.grid.Column} clm The column being moved.
			 * @param {Number} oldPos The column's previous(old) position.
			 * @param {Number} newPos The column's new position where it was moved.
			 */
			'changeColumnPosition',
			
			/**
			 * @event 'changeColumnLabel' Fires when a column's header was modified 
			 * @param {Ext.grid.Column} clm The column which header was modified.
			 * @param {Number} clmIndex The column index inside {@link Ext.grid.ColumnModel}.
			 * @param {String} value The header's new value.
			 */
			'changeColumnLabel',
			
			/**
			 * @event 'deleteColumn' Fires after a column was deleted
			 * @param {String} clmName The colomn <tt>name</tt> attribute
			 */
			'deleteColumn'
		);
		
		this.on({
			scope: _this,
			
			columnmove: _this.onColumnMove,
			
			contextmenu: function(e) {
				e.preventDefault();
			}
		});
	}//eo _afterInitComponent
	
	/**
	 * After construction view configuration 
	 */
	,configureView : function() {
		var _this  = this,
			vm     = this.viewMeta,
		    bbar   = this.getTopToolbar(),
		    aBar   = bbar.getComponent('actions'),
		    aMore  = aBar.getComponent('more');    
		
		//Actions
		if (vm['i:actions'] && vm['i:actions']['i:action']) {
			var act = vm['i:actions']['i:action'];
			if (Ext.isArray(act)) {
				Ext.iterate(act, function(a) {
					_this.addIAction(a);
				});
			} else {
				_this.addIAction(act);
			}
		}		
		//More Actions
		if (vm['i:fields']) {
			var selectable = vm['i:fields'].selectable ? vm['i:fields'].selectable.bool() : true,
				exportable = vm['i:fields'].exportable ? vm['i:fields'].exportable.bool() : true,
				expandedView = vm['i:fields'].expandButton ? vm['i:fields'].expandButton.bool() : false;
				
			//selectable
			if (selectable) {
				aMore.menu.getComponent('sel-all').enable();
				aMore.menu.getComponent('desel-all').enable();				
			} else {
				aMore.menu.getComponent('sel-all').disable();			
				aMore.menu.getComponent('desel-all').disable();				
			}
			//exportable
			if (exportable) {
				aMore.menu.getComponent('exports').show();
			} else {
				aMore.menu.getComponent('exports').hide();
			}			
			//expandButton
			if (expandedView) {
				aBar.getComponent('expanded-view').show();
			} else {
				aBar.getComponent('expanded-view').hide();
			}			
		}		
		if (vm['i:moreactions'] && vm['i:moreactions']['i:action']) {
			var act = vm['i:moreactions']['i:action'];
			if (Ext.isArray(act)) {
				Ext.iterate(act, function(a) {
					_this.addMoreAction(a);
				});
			} else {
				_this.addMoreAction(act);
			}
		}

		this.updateActionBarVisibilityState();
	}//eo configureView
	
	/**
	 * Handler of <u>columnmove</u> event.
	 * @param {Number} oldIndex
	 * @param {Number} newIndex
	 */
	,onColumnMove : function(oldIndex, newIndex) {
		if (oldIndex != newIndex) {
			var clm = this.getColumnModel().config[newIndex];
			this.fireEvent('changeColumnPosition', clm, oldIndex, newIndex);	
		}
	}//eo onColumnMove
	
	/**
	 * Updates action bar <u>visibility</u> state. 
	 */
	,updateActionBarVisibilityState : function() {
		var aBar = this.getTopToolbar().getComponent('actions'),		
			aHidden = 0;

		this.updateMoreActionVisibilityState();
			
		aBar.items.each(function(i) {
			if (i.hidden) {
				aHidden++;
			}
		});		
		if (aHidden > 0 && ((aHidden + 1)  == aBar.items.getCount())) {
			aBar.hide();
		} else {
			aBar.show();
		}		
		this.doLayout();
	}//eo updateActionBarVisibilityState
	
	/**
	 * Updates <i>more actions</i> <u>visibility</u> state.
	 */
	,updateMoreActionVisibilityState : function() {
		var aBar   = this.getTopToolbar().getComponent('actions'),		
			aMore  = aBar.getComponent('more'),
			bSel   = aMore.menu.getComponent('sel-all'),
			bDesel = aMore.menu.getComponent('desel-all');				
		
		if (bSel.disabled && bDesel.disabled) {
			var ic = 2;	
			aMore.menu.items.each(function(i) {
				if (i.hidden) {
					ic++;
				}
			});
			if (ic == aMore.menu.items.getCount()) {
				aMore.hide();
			} else {
				aMore.show();
			}
		} else {
			aMore.show();
		}		
	}//eo updateMoreActionVisibilityState
});

/**
 * Adds Mixin ListMetaProcessor Class
 */
Ext.apply(afStudio.wd.list.SimpleListView.prototype, afStudio.wd.list.ListMetaProcessor);

/**
 * @type 'afStudio.wd.list.simpleListView'
 */
Ext.reg('afStudio.wd.list.simpleListView', afStudio.wd.list.SimpleListView);