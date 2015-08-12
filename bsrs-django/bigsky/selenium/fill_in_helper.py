class FillInHelper(object):
    '''
    This Helper will loop through model's attributes and find the element on the page
    and fill in input with the attributes' values
    Ensure model has attrs (k) equal to id on template 
    '''
    def _fill_in(self, model):
        for k, v in model.__dict__.iteritems():
            setattr(self, k + '_input', self.wait_for_xhr_request_id(k))
            inputrr = getattr(self, k + '_input')
            inputrr.send_keys(v)


class FillInDictHelper(object):
    '''
    This Helper will loop through model's attributes and find the element on the page
    and fill in input with the attributes' values
    Ensure model has attrs (k) equal to id on template 
    '''
    def _fill_in_dict(self, dict_):
        for k, v in dict_.iteritems():
            setattr(self, k + '_input', self.wait_for_xhr_request_id(k))
            inputrr = getattr(self, k + '_input')
            inputrr.send_keys(v)