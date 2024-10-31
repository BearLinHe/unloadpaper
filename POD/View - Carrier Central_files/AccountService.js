'use strict';

angular.module('carpApp').service('AccountService', function (UtilService) {
    this.validateOnboardingInfo = function ( onboardingInfo, isTransportationIdRequired, accountAlreadyExists, isSmallParcelCarrierAllowed, isJPAccountRequestValidationRequired ) {
        var errorMessages = [];
        if ( !accountAlreadyExists  ) {
            if ( UtilService.isEmpty( onboardingInfo.companyCode ) ) {
                errorMessages.push( $('#scac_vendor_empty').text() );
            } else if ( onboardingInfo.companyType.toString() === "CARRIER" ) {
                errorMessages = errorMessages.concat( UtilService.validateScac( onboardingInfo.companyCode ) );
            } else if ( isSmallParcelCarrierAllowed && onboardingInfo.companyType.toString() === "SMALL_PARCEL_CARRIER" ) {
                errorMessages = errorMessages.concat( UtilService.validateScac( onboardingInfo.companyCode ) );
            } else if ( onboardingInfo.companyCode.toString().length > 100 ) {
                errorMessages.push( $('#vendor_code_too_long_2').text() );
            }
            if ( UtilService.isEmpty( onboardingInfo.companyName ) ) {
                errorMessages.push( $('#company_name_required').text() );
            } else if ( !UtilService.isEmpty( onboardingInfo.companyName )
                 && onboardingInfo.companyName.toString().length > 100 ) {
                errorMessages.push( $('#company_name_too_long').text() );
            }
            if (UtilService.isEmpty( onboardingInfo.contactEmail )
                || !UtilService.isEmail( onboardingInfo.contactEmail ) ) {
                errorMessages.push( $('#contact_email_wrong_format').text() );
            } else if ( onboardingInfo.contactEmail.toString().length > 100 ) {
                errorMessages.push( $('#contact_email_too_long').text() );
            }
            if ( UtilService.isEmpty( onboardingInfo.contactName ) ) {
                errorMessages.push( $('#contact_name_required').text() );
            } else if ( !UtilService.isEmpty( onboardingInfo.contactName )
                 && onboardingInfo.contactName.length > 100 ) {
                errorMessages.push( $('#contact_name_too_long').text() );
            }
            if ( UtilService.isEmpty( onboardingInfo.contactPhone ) ) {
                errorMessages.push( $('#contact_phone_required').text() );
            } else if ( !UtilService.isEmpty( onboardingInfo.contactPhone )
                 && !UtilService.isPhone( onboardingInfo.contactPhone ) ) {
                errorMessages.push( $('#contact_phone_wrong_length').text() );
            }
        }
        if ( !( isSmallParcelCarrierAllowed && onboardingInfo.companyType.toString() === "SMALL_PARCEL_CARRIER" ) ) {
            if ( UtilService.isEmpty( onboardingInfo.poid ) ) {
                errorMessages.push( $('#po_empty').text() );
            } else if ( onboardingInfo.poid.toString().length > 100 ) {
                errorMessages.push( $('#po_too_long').text() );
            }
            if ( UtilService.isEmpty( onboardingInfo.fc ) ) {
                errorMessages.push( $('#fc_empty').text() );
            } else if ( this.isFcInvalid( onboardingInfo.fc.toString() ) ) {
                errorMessages.push( $('#fc_invalid').text() );
            }
        }
        if ( isTransportationIdRequired ) {
            if ( UtilService.isEmpty( onboardingInfo.transportationIdValue ) ) {
                errorMessages.push( $('#transportation_id_empty').text() );
            }
        }
        if ( isJPAccountRequestValidationRequired ) {
            if ( UtilService.isEmpty( onboardingInfo.jpAccountRequestValidationIdValue ) ) {
                errorMessages.push( $('#jp_account_request_validation_empty').text() );
            }
        }
        return errorMessages.join('\n');
    };

    this.validateAccountInfoUpdate = function ( accountInfoUpdate ) {
        var errorMessages = [];
        if ( UtilService.isPresent( accountInfoUpdate.newContactEmail ) ) {
            if ( UtilService.isEmpty( accountInfoUpdate.newContactEmail ) || !UtilService.isEmail( accountInfoUpdate.newContactEmail ) ) {
                errorMessages.push( $('#contact_email_wrong_format').text() );
            } else if ( accountInfoUpdate.newContactEmail.toString().length > 100 ) {
                errorMessages.push( $('#contact_email_too_long').text() );
            }
        }
        if ( UtilService.isPresent( accountInfoUpdate.newContactPhone ) ) {
            if ( UtilService.isEmpty( accountInfoUpdate.newContactPhone ) ) {
                errorMessages.push( $('#contact_phone_required').text() );
            } else if ( !UtilService.isPhone( accountInfoUpdate.newContactPhone ) ) {
                errorMessages.push( $('#contact_phone_wrong_length').text() );
            }
        }
        if ( UtilService.isPresent( accountInfoUpdate.newContactName ) ) {
            if ( UtilService.isEmpty( accountInfoUpdate.newContactName ) ) {
                errorMessages.push( $('#contact_name_required').text() );
            } else if ( accountInfoUpdate.newContactName.toString().length > 100 ) {
                errorMessages.push( $('#contact_name_too_long').text() );
            }
        }
        return errorMessages.join('\n');
    };

    this.isFcInvalid = function ( fc ) {
        const validFcRegEx = /^[A-Z0-9]{4}$/;
        return !validFcRegEx.test( fc );
    }

});
