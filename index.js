$(function() {
    $('#myForm input').change(function() {
        $(this).removeClass('error');
    })

    $('#myForm').submit(function(e){
        e.preventDefault();
        new MyForm().submit();
    })
})

function MyForm() {
    this.form = $('#myForm');

    this.fields = [ 
        initField('fio', this.form, validateFIO),
        initField('email', this.form, validateEmail),
        initField('phone', this.form, validatePhone)
    ];
}

MyForm.prototype.constructor = MyForm;
MyForm.prototype.validate = function() {
    var validationResult = this.fields.map(function(field) {
        return { 
            isValid: field.validate(), 
            fieldName: field.name
        };
    });

    return {
        isValid: validationResult
            .every(function (res) { 
                return res.isValid 
            } ),
        errorFields: validationResult
            .filter(function (res) { 
                return !res.isValid 
            })
            .map(function (res) {
                return res.fieldName
            })
    };
}
MyForm.prototype.getData = function() {
    var data = {};
    this.fields.forEach(function(field) {
        data[field.name] = field.entity.val();
    });
    return data;
}
MyForm.prototype.setData = function(data) {
    this.fields.forEach(function(field) {
        var value = data[field.name];
        if (value != undefined) {
            field.entity.val(value);
        }
    });
}
MyForm.prototype.submit = function() {
    var validationResult = this.validate();
    if (validationResult.isValid) {
        submit(this.form);
    } else {
        markErrors(this.form, validationResult.errorFields);
    }
}

function initField(name, form, validator) {
    var entity = form.find('input[name=' + name +']');
    return {
        entity: entity,
        name: name,
        validate: function() {
            return validator(entity)
        }
    }
}

function markErrors(form, errorFields) {
    errorFields.forEach(function(name) {
        var field = form.find('input[name=' + name +']');
        field.addClass('error');
    });
}

function validateFIO(field) {
    var valid = field.val()
        .split(' ')
        .filter(function(word) {
            return word;
        })
        .length == 3;

    return valid;
}

function validateEmail(field) {
    var domains = [ "ya.ru", "yandex.ru", "yandex.ua", "yandex.by", "yandex.kz", "yandex.com" ];
    var email = field.val().toLowerCase();

    var valid = domains.some(function(domain) {
        return email.endsWith('@' + domain);
    });

    return valid;
}

function validatePhone(field) {
    var phone = field.val();
    var format = /\+7\(\d\d\d\)\d\d\d-\d\d-\d\d/;

    if (!phone.match(format))
        return false;

    var checksum = phone.split('')
        .reduce(function(sum, char) {
            if ($.isNumeric(char)) {
                return sum + (+char);
            } else {
                return sum;
            }
        }, 0);

    var valid = checksum <= 30;
    return valid;
}

function submit(form) {
    $.ajax({
        url: form.attr('action'),
        success: function (data) {
            process(data, form);
        },
        error: function (data) {
            console.error('An error occurred.');
        },
    });
}

function process(data, form) {
    var resultContainer = $('#resultContainer');
    resultContainer.removeClass();

    switch(data.status) {
        case 'success': 
            resultContainer.addClass('success').html('Success');
            break;
        case 'error':
            resultContainer.addClass('error').html(data.reason);
            break;
        case 'progress':
            setTimeout(function () {
                submit(form)
            }, data.timeout);
            break;
        default:
            console.error('Unknown answer status: ' + data.status);
    }
}

