/**
 * Move into overrides or create custom component?
 */

Ext.override(Ext.grid.GridDragZone, {
	afterRepair : function() {
		Ext.fly(this.DDM.currentTarget).parent('TABLE').frame('#FFA7A7', 1);
	    this.dragging = false;    
	}
});
		    
Ext.ns('afStudio.wd');

/**
 * WidgetsBuilder
 * @class afStudio.wd.WidgetsBuilder
 * @extends Ext.Window
 * @author PavelK
 */
afStudio.wd.WidgetsBuilder = Ext.extend(Ext.Window, {
	/**
	 * Function onWndShow
	 * Creates Drag/DropZones for FieldsGrid and relataions grid
	 */
	onWndShow : function() {
		var _this = this;
	    
	    /**
	     * DZ for relations grid
	     */
	    var relGridDropTargetEl =  this.relationsGrid.getView().scroller.dom;
	    
	    new Ext.dd.DropTarget(relGridDropTargetEl, {
            ddGroup    : 'widgetsBuilder',
            notifyDrop : function(ddSource, e, data){

                var records =  ddSource.dragData.selections;
                var fr = _this.fieldsGrid.getSelectionModel().getSelected();
				var mn = _this.modelsTree.getSelectionModel().getSelectedNode();
				var m  = _this.modelsTree.getModel(mn);
				
				if(fr){
                    Ext.each(records, ddSource.grid.store.remove, ddSource.grid.store);
					var r = new _this.RelationRec({
				        id: fr.get('id'),
				        model: m ,
				        name: m + '.' + fr.get('name'),
				        field: fr.get('name'),
				        type: fr.get('type'),
				        size: fr.get('size'),
                                        required: fr.get('required')
					});
					
                    _this.relationsGrid.store.add(r);
                    _this.relationsGrid.store.sort('name', 'ASC');
                    return true;
				} else {
					this.dragging = false;    
				}
            }
        });
		
		/**
		 * Create Basket drop zone
		 */
		var basket = Ext.getCmp('widgets-basket');
		var basketDropTargetEl =  basket.body.dom;

		new Ext.dd.DropTarget(basketDropTargetEl, {
			ddGroup     : 'widgetsBuilderRel',
			notifyEnter : function(ddSource, e, data) {
		        basket.body.stopFx();
		        var grid_id = data.grid.getId();
		        if('fields-grid' == grid_id){
			        return this.dropNotAllowed;
		        } else {
					//Add some flare to invite drop.
					basket.body.highlight('#E56060');
					return this.dropAllowed;
		        }
			},
				
			notifyDrop  : function(ddSource, e, data){
				var grid_id = data.grid.getId();
				if('fields-grid' == grid_id){
					Ext.fly(this.DDM.currentTarget).parent('TABLE').frame('#8db2e3', 1);
					this.dragging = false;
					return false;
				} else {
					var selectedRecord = ddSource.dragData.selections[0];
					ddSource.grid.store.remove(selectedRecord);
					return true;						
				}
			}
		});
	}
	
	/**
	 * Loads Model's Fields
	 * @param {Ext.tree.TreeNode} modelNode
	 * @param {Function} callback
	 */
	,loadModelFields : function(modelNode, callback) {
		var s = this.modelsTree.getSchema(modelNode),
			m = this.modelsTree.getModel(modelNode);
			
		this.fieldsGrid.getStore().load({
			params: {schema: s, model: m},
			callback: callback || Ext.emptyFn
		});
	}
	
	/**
	 * ModelTree <u>click</u> event listener
	 * @param {Ext.tree.TreeNode} node
	 * @param {Ext.EventObject} e
	 */
	,onModelClick : function(node, e) {
		this.fieldsGrid.show();
		this.loadModelFields(node);
	}
	
	/**
	 * ModelTree <u>modelsload</u> event listener
	 * @param {Ext.tree.Loader} loader
	 * @param {XMLHttpRequest} response
	 */
	,onModelsLoad : function(loader, response) {
		this.fieldsGrid.getStore().removeAll();
		this.fieldsGrid.hide();
	}
	
	/**
	 * Function onRelGridRefresh
	 * Function creates Tooltips with specification of selected field.
	 *  
	 * @param {Object} GridView
	 */
	,onRelGridRefresh: function(view){
		var grid = view.grid;
   		var ds = grid.getStore();
    	for (var i=0, rcnt=ds.getCount(); i<rcnt; i++) {
    		
    		var rec = ds.getAt(i);
    		
    		var html = '<b>Field Specification</b><br>';
    		html += '<br><b>Model: </b>' + rec.get('model');
    		html += '<br><b>Field: </b>' + rec.get('field');
			
			if(type = rec.get('type')) {
	    		html += '<br><b>Type: </b>' + type;
			}

			if(size = rec.get('size')) {
	    		html += '<br><b>Size: </b>' + size;
			}
			
        	var row = view.getRow(i);
        	var els = Ext.get(row).select('.x-grid3-cell-inner');
    		for (var j=0, ccnt=els.getCount(); j<ccnt; j++) {
          		Ext.QuickTips.register({
            		target: els.item(j),
            		text: html
        		});
    		}
		}
	}
	
	/**
	 * Initializes component
	 * @private
	 * @return {Object} The configuration object 
	 */
	,_beforeInitComponent : function() {
		var _this = this;
		
		this.RelationRec = Ext.data.Record.create([
		    'id',
		    'model',
		    'name',
		    'field',
		    'type',
		    'size'
		])
		
		this.relationsGrid = new Ext.grid.GridPanel({
			id: 'rel-grid',
			flex: 1, 
			width: 234,
			ddGroup: 'widgetsBuilderRel', 
			enableDragDrop: true,
			store: new Ext.data.ArrayStore({
			    idIndex: 0,
			    fields: [
			       'id', 'model', 'name', 'field', 'type', 'size'
			    ]
			}),
			viewConfig: {
				scrollOffset: 19, 
				forceFit: true
			},
			columns: [
				{header: 'Selected fields', sortable: true, width: 170, dataIndex: 'name'}
			],
			loadMask: true,
			border: true,
			style: 'padding-bottom: 5px;',
			autoScroll: true
		});
		
		this.fieldsGrid = new Ext.grid.GridPanel({
			id: 'fields-grid',
			ref: '../fieldsGrid',
			ddGroup: 'widgetsBuilder',
			enableDragDrop: true,			
			store: new Ext.data.JsonStore({
				url: _this.fieldsUrl,
				autoLoad: false,				
				baseParams: {
					xaction: 'read'
				},
				root: 'rows',
				idProperty: 'id',    							
				fields: ['id', 'name', 'type', 'size', 'required']
			}),
			sm: new Ext.grid.RowSelectionModel({
				singleSelect: true
			}),
			columns: [
				{header: 'Name', sortable: true, width: 150, dataIndex: 'name'},
				{header: 'Type', sortable: true, width: 110, dataIndex: 'type'},
				{header: 'Size', sortable: true, width: 60, dataIndex: 'size'}
			],
			loadMask: true,
			border: false,
			autoScroll: true,
			hidden: true
		});
		
		this.basket = new Ext.Panel({
			id: 'widgets-basket',
			xtype: 'panel',  
			html: '<center><br>Drop Item here,<br> to remove it</br></center>', 
			bodyStyle: 'padding: 5px;', 
			height: 70, 
			width: 234
		});
		
		this.modulesCombo = new Ext.ux.form.GroupingComboBox({
            fieldLabel: 'Module Location',
			loadingText: 'Please wait...',
			emptyText: 'Please select the module location...',
            store: new Ext.data.JsonStore({
	            url: afStudioWSUrls.getModulesUrl(),
	            baseParams: {
	            	cmd: 'getGrouped'
	            },
	            totalProperty: 'total', 
	            idProperty: 'value',
	            fields: ['value', 'text', 'group'],	        	
                remoteSort: true
            }),
            displayField: 'text',
			groupField: 'group',
            anchor: '100%',
			minChars: 0,
            hiddenName: 'model'
		});		
		
		this.actionInput = new Ext.form.TextField({fieldLabel: 'Widget Name', anchor: '100%'});
				
		this.typeCombo = new Ext.form.ComboBox({
            fieldLabel: 'Widget Type', 
            triggerAction: 'all', 
            anchor: '100%', 
			store: [['list', 'List'], 
					['grid', 'Grid'], 
					['edit', 'Edit'], 
					['show', 'Show']],
			value: 'list'
		});
		
		return {
			title: 'Create new widget',
			y: 150,
			width: 450, height: 150,
			modal: true, 
			tbar: {
				xtype: 'toolbar',
				id: this.id + 'help-toolbar', hidden: true,
				items: [
					'Please select the fields for each model you want to have displayed in your Widget. And drag each field to the Selected fields area.'
				]
			},

			layout: 'card',
			activeItem: 0,
			
			items: [
			{
				border: false, bodyBorder: false,
				hideBorders: true,
				items: [
					new Ext.FormPanel({
						bodyStyle: 'padding: 5px;', labelWidth: 100,
						items: [
							this.modulesCombo,
							this.actionInput,
							this.typeCombo
						]
					})
				]
			},{
				border: false, bodyBorder: false,
				xtype: 'panel',
				layout: 'border',
				items: [
					{
						region: 'west', layout: 'fit',
						margins: '5 5 5 5', width: 220,
						items: [
							{xtype: 'afStudio.models.modelTree', url: _this.modelsUrl, border: false, ref: '../../modelsTree'}
						]
					}, {	
						region: 'center', margins: '5 5 5 0', layout: 'fit',
						items: this.fieldsGrid
					},{	
						region: 'east', margins: '5 5 5 0', 
						width: 235, layout: 'vbox', 
						border: false, bodyBorder: false,
						bodyStyle: 'background-color: #DFE8F6',
						items: [this.relationsGrid, this.basket]
					}		
				]
			}],
			buttonAlign: 'left',
			buttons: [
			{
				text: 'Cancel', 
				handler: this.cancel, 
				scope: this
			},'->',{	
				text: '&laquo; Back',
				id: this.id + '-back-btn',
				handler: this.chStep.createDelegate(_this, [0]), 
				disabled: true
			},{
				text: 'Next &raquo;',
				id: this.id + '-next-btn',
				handler: this.chStep.createDelegate(_this, [1])
			},{
				text: 'Save &raquo;',
				id: this.id + '-save-btn',
				hidden: true,
				handler: this.create, 
				scope: this
			}]
		};	
	}//eo _beforeInitComponent	
	
	/**
	 * ExtJS template method
	 * @private
	 */
	,initComponent: function() {
		Ext.apply(this, 
			Ext.apply(this.initialConfig, this._beforeInitComponent())
		);		
		afStudio.wd.WidgetsBuilder.superclass.initComponent.apply(this, arguments);
		this._afterInitComponent();
	}

	/**
	 * Initializes events & does post configuration
	 * @private
	 */	
	,_afterInitComponent : function() {
		
		this.addEvents(
			/**
			 * @event 'widgetcreated' Fires when widget is created.
			 * @param {String} widgetUri The created widget's URI
			 * @param {Object} response The create request response object.
			 */
			'widgetcreated'
		);
		
		this.on('show', this.onWndShow, this);
		
		this.relationsGrid.getView().on('refresh', this.onRelGridRefresh);
		
		this.modelsTree.on({
			'click' : Ext.util.Functions.createDelegate(this.onModelClick, this),
			'modelsload' : Ext.util.Functions.createDelegate(this.onModelsLoad, this)			
		});
	}//eo _afterInitComponent	
	
	/**
	 * Function chStep
	 * Changes wizard step and prepares page UI
	 * @param {Number}  stepNo - New step number
	 */
	,chStep: function(stepNo){
		var panel = Ext.getCmp(this.id);
		if(1 == stepNo) {
			var size = {width: 840, height: 450};
			Ext.getCmp(this.id + '-save-btn').show();
			Ext.getCmp(this.id + '-next-btn').hide();
			Ext.getCmp(this.id + '-back-btn').enable();
			Ext.getCmp(this.id + 'help-toolbar').show();
		} else {
			var size = {width: 450, height: 150};
			Ext.getCmp(this.id + '-save-btn').hide();
			Ext.getCmp(this.id + '-next-btn').show();
			Ext.getCmp(this.id + '-back-btn').disable();
			Ext.getCmp(this.id + 'help-toolbar').hide();
		}
		
		this.setSize(size);
		this.setPagePosition( (Ext.getBody().getWidth()-size.width)/2, 150);		
		panel.getLayout().setActiveItem(stepNo);
	}
	
	/**
	 * Function create
	 * Handler for "Create Widget" operation
	 */
	,create: function(){
		var items = [];
		
		//each item contains data.field, data.id, data.model, data.name, data.size, data.type
		this.relationsGrid.getStore().each(function(rec) {
            if (rec.data) {
                items.push(rec.data);
            }
		});
		
		var module = this.modulesCombo.getValue(),
			action = this.actionInput.getValue(),
			widgetUri = module + '/' + action,
			type = this.typeCombo.getValue();
		
		var widgetMetaData = afStudio.wd.WidgetFactory.buildWidgetDefinition(items, type);
		
		var afsWD = new afStudio.wd.WidgetDefinition({
			widgetUri: widgetUri,
			widgetType: type
		});
		
		var callback = Ext.util.Functions.createDelegate(function(response) {			
			this.fireEvent('widgetcreated', widgetUri, response);
			this.close();
		}, this);
		
		afsWD.saveDefinition(widgetMetaData, callback, true);
	}	
	
	/**
	 * Function cancel
	 * Close window
	 */
	,cancel : function() {
		this.close();
	}
	

});