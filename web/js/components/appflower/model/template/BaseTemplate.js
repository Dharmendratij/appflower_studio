Ext.ns('afStudio.model.template');

N = afStudio.model.template;

N.BaseTemplate = Ext.extend(Object, {

	structure : [
		afStudio.ModelNode.TITLE
	],	
	
	processStructure : function(model) {
		Ext.iterate(this.structure, function(n, idx) {
			if (model.getModelNode(n) == null) {
				model.createNode(n);
			}
		});
	}
});

delete N;