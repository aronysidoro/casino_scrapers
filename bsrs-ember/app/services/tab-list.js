import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/store';

export default Ember.Service.extend({
  store: inject('main'),
  previousLocation: undefined,
  /* Default to redirectRoute defined on module route if all redirect route locations are the same
   * previousLocation is logged with each tab and will redirect to that location if user visits tab directly from a different module
   * single tab types do not redirect unless tab is closed or single tab is deleted.  Rollback and cancel do not transition
   * @param {string} tab 
   * @param {string} current_route 
   * @param {string} action 
   */
  redirectRoute(tab, action, confirmed, transitionFunc) {
    const prev = this.get('previousLocation');
    // if (prev && !prev.split('.')[0].includes(tab.get('module'))) {
    //   return transitionFunc(prev);
    // }
    const redirectRoute = tab.get('redirectRoute');
    const closeTabRedirect = tab.get('closeTabRedirect');
    const deleteRedirect = tab.get('deleteRedirect');
    const tabType = tab.get('tabType');
    debugger;
    if (action === 'closeTab' && tabType === 'multiple') {
      return closeTabRedirect ? transitionFunc(closeTabRedirect) : transitionFunc(redirectRoute);
    } else if (action === 'delete') {
      return transitionFunc(redirectRoute);
    } else if (tabType === 'single') {
      if (action === 'closeTab') {
        return transitionFunc(closeTabRedirect);
      } else if (action === 'delete' && confirmed) {
        return transitionFunc(redirectRoute);
      } else if (action === 'rollback' && tab.get('newModel')) {
        return transitionFunc(redirectRoute);
      }
      /* If single and not closing or deleting it, then don't redirect */
      return;
    }
    transitionFunc(redirectRoute);
  },
  // /* logs route from willDestroyElement of every component
  //  * @param {string} route 
  //  */
  // logLocation(route) {
  //   const store = this.get('store');
  //   const tabs = store.find('tab');
  //   const tab_singles = store.find('tab');
  //   tabs.forEach((tab) => {
  //     run(() => {
  //       store.push('tab', {id: tab.get('id'), previousLocation: route});
  //     });
  //   });
  //   tab_singles.forEach((tab) => {
  //     run(() => {
  //       store.push('tab', {id: tab.get('id'), previousLocation: route});
  //     });
  //   });
  // },
  /* Determines if model or models (if trying to close single tab) is dirty based on type 
   * @param {string} route 
   * @param {string} action 
   * @return {boolean}
   */
  showModal(tab, action, confirmed) {
    if (tab.get('tabType') === 'single' && (action === 'closeTab' || action === 'cancel')) {
      const store = this.get('store');
      const models = store.find(tab.get('moduleList'));
      if (tab.get('newModel')) {
        const model = store.find(tab.get('module'), tab.get('model_id'));
        return model.get('isDirtyOrRelatedDirty');
      }
      return models.isAny('isDirtyOrRelatedDirty');
    }
    return (!confirmed && action === 'delete' || action === 'deleteAttachment') ? true : tab.get('model').get('isDirtyOrRelatedDirty');
  },
  callCB(tab) {
    const cb = tab.get('transitionCB');
    if(cb) {
      cb();    
    } 
  },
  findTab(id) {
    const store = this.get('store');
    const tab = store.find('tab', id);
    if (!tab.get('content')) {
      return store.find('tab', {model_id: id}).objectAt(0);
    }
    return tab;
  },
  createTab(args){
    let { id, module, routeName, redirectRoute, templateModelField, newModel, transitionCB } = args;
    this.get('store').push('tab', {
      id: id,
      tabType: 'multiple',
      module: module,
      routeName: routeName,
      templateModelField: templateModelField,
      redirectRoute: redirectRoute,
      newModel: newModel,
      transitionCB: transitionCB,
    });
  },
  createSingleTab(args){
    let { module, routeName, displayText, redirectRoute, closeTabRedirect, transitionCB, model_id, newModel } = args;
    this.get('store').push('tab', {
      id: module,
      tabType: 'single',
      model_id: model_id, 
      module: module,
      moduleList: `${module}-list`,
      routeName: routeName,
      displayText: displayText,
      redirectRoute: redirectRoute,
      closeTabRedirect: closeTabRedirect,
      transitionCB: transitionCB,
      newModel: newModel || false,
    });
  },
  closeTab(id){
    this.get('store').remove('tab', id);
  }
});
