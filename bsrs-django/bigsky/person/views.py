'''
Created on Jan 16, 2015

@author: tkrier
'''
# from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission, User
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import detail_route

from person.serializers import (PersonStatusSerializer, PersonSerializer,
    PersonListSerializer, PersonContactSerializer, PersonCreateSerializer,
    RoleSerializer
    )
from person.models import Person, PersonStatus, Role
from person.permissions import BSModelPermissions


### PERSON STATUS ###

class PersonStatusViewSet(viewsets.ModelViewSet):

    queryset = PersonStatus.objects.all()
    serializer_class = PersonStatusSerializer
    permission_classes = (permissions.IsAuthenticated,)


### PERSON ###

class PersonContactViewSet(viewsets.ModelViewSet):
    """
    API endpoint for People with all thier Contact Information.
    """
    queryset = Person.objects.all()
    serializer_class = PersonContactSerializer
    permission_classes = (permissions.IsAuthenticated,)


class PersonViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    
    includes model level permissions, not user level yet
    """
    queryset = Person.objects.all()
    serializer_class = PersonCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    # def get_serializer_class(self):
    #     pass

    # def list(self, request):
    #     serializer = PersonListSerializer(self.queryset, many=True)
    #     return Response(serializer.data)

    # def create(self, request, *args, **kwargs):
    #     serializer = PersonCreateSerializer(data=request.DATA)
    #     return super(PersonViewSet, self).create(request, *args, **kwargs)

    # def retrieve(self, request, pk=None):
    #     person = get_object_or_404(User, pk=pk)
    #     serializer = PersonSerializer(person)
    #     return Response(serializer.data)

    # def update(self, request, pk=None):
    #     pass

    # def partial_update(self, request, pk=None):
    #     pass
    
    # def get_serializer_class(self):
    #     """
    #     set the serializer based on the method
    #     """
    #     if (self.action == 'retrieve'):
    #         self.serializer_class = PersonFullSerializer
    #     elif (self.action == 'list'):
    #         self.serializer_class = PersonListSerializer
    #     else:
    #         self.serializer_class = PersonSerializer
    #     return self.serializer_class
    
    # @detail_route(methods=['get'])
    # def perms(self, request, pk):
    #     '''
    #     Get permissions for the current user and a model. Permissions must be set on a role.
    #     '''
    #     respObj = {}
    #     perms = {}
        
    #     if request.method == 'GET':
    #         user = self.get_object()
    #         if not request.query_params.has_key('model'):
    #             # no model specified
    #             respObj['code'] = 400
    #             respObj['message'] = 'Please specify a model'
    #             return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
    #         else:
    #             model = request.query_params['model']
    #             ctype = ContentType.objects.filter(model=model)
    #             if ctype.count() == 0:
    #                 respObj['code'] = 400
    #                 respObj['message'] = 'Model (' + model + ') is not valid'
    #                 return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
                    
    #             perms = self._getPersonPerms(user, model)
    #             return Response(perms)
    #     else:
    #         # should never get here
    #         respObj['code'] = 400
    #         respObj['message'] = 'Method not supported - ' + request.method
    #         return Response(respObj, status=status.HTTP_400_BAD_REQUEST)

    # def _getPersonPerms(self, person, model):
    #     '''
    #     Helper function to get the current permissions of the user
    #     '''
    #     perms = {}

    #     ctype = ContentType.objects.filter(model=model)
    #     availPerms = Permission.objects.filter(content_type=ctype)
            
    #     for aperm in availPerms:
    #         perms[aperm.codename] = False
    #         if person.has_perm('person.' + aperm.codename):
    #             perms[aperm.codename] = True
                                
    #     return perms


### ROLE ###

class RoleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows roles to be viewed or edited.
    """
    permission_classes = [BSModelPermissions]
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

    @detail_route(methods=['get', 'put'])
    def perms(self, request, pk):
        '''
        get or set permissions for a role and a model
        
        e.g. /roles/1/perms/?model=location
        
        returns object with all available permissions for that model set to true or false
        
        '''
        respObj = {}
        perms = {}
        
        if request.method == 'GET':
            role = self.get_object()
            if not request.query_params.has_key('model'):
                #no model specified
                respObj['code'] = 400
                respObj['message'] = 'Please specify a model'
                return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
            else:
                model = request.query_params['model']
                ctype = ContentType.objects.filter(model=model)
                if ctype.count() == 0:
                    respObj['code'] = 400
                    respObj['message'] = 'Model (' + model + ') is not valid'
                    return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
                    
                perms = self._getRolePerms(role, model)
                return Response(perms)
                            
        elif request.method == 'PUT':
            role = self.get_object()
            if not request.query_params.has_key('model'):
                #no model specified
                respObj['code'] = 400
                respObj['message'] = 'Please specify a model'
                return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
            
            else:
                model = request.query_params['model']
                ctype = ContentType.objects.filter(model=model)
                if ctype.count() == 0:
                    respObj['code'] = 400
                    respObj['message'] = 'Model (' + model + ') is not valid'
                    return Response(respObj, status=status.HTTP_400_BAD_REQUEST)

                permobj = request.DATA
                for perm, value in permobj.items():
                    rperm = role.group.permissions.filter(codename=perm)
                    aperm = Permission.objects.filter(codename=perm)
                    if aperm.count() > 0:
                        aperm = aperm[0]
                    
                        if value == True:
                            if not rperm:
                                role.group.permissions.add(aperm)
                                
                        if value == False:
                            if rperm:
                                role.group.permissions.remove(aperm)
                                
                    else:
                        respObj['code'] = 400
                        respObj['message'] = 'Permission does not exist - ' + perm
                        return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
                
                perms = self._getRolePerms(role, model)    
                return Response(perms)
        
        else:
            respObj['code'] = 400
            respObj['message'] = 'Method not supported - ' + request.method
            return Response(respObj, status=status.HTTP_400_BAD_REQUEST)


    def _getRolePerms(self, role, model):
        '''
        Helper function to get the current permissions
        '''
        perms = {}

        ctype = ContentType.objects.filter(model=model)
        rolePerms = role.group.permissions.filter(content_type=ctype)
        availPerms = Permission.objects.filter(content_type=ctype)
            
        for aperm in availPerms:
            perms[aperm.codename] = False
            for rperm in rolePerms:
                if rperm.id == aperm.id:
                    perms[aperm.codename] = True
                    break            
                                
        return perms
