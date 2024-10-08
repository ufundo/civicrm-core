<?php

return [
  'name' => 'UFGroup',
  'table' => 'civicrm_uf_group',
  'class' => 'CRM_Core_DAO_UFGroup',
  'getInfo' => fn() => [
    'title' => ts('Profile'),
    'title_plural' => ts('Profiles'),
    'description' => ts('User framework groups. Each group represents a form which encompasses a set of fields defined in civicrm_uf_fields table. Initially will be used for CiviCRM Profile form(s). Subsequently we anticipate using this to define other public facing forms (e.g. online donation solicitation forms, mailing list preferences, etc.).'),
    'log' => TRUE,
    'add' => '1.1',
    'label_field' => 'title',
  ],
  'getPaths' => fn() => [
    'add' => 'civicrm/admin/uf/group/add?action=add&reset=1',
    'preview' => 'civicrm/admin/uf/group/preview?reset=1&gid=[id]',
    'update' => 'civicrm/admin/uf/group/update?action=update&reset=1&id=[id]',
    'delete' => 'civicrm/admin/uf/group/update?action=delete&reset=1&id=[id]',
    'browse' => 'civicrm/admin/uf/group',
    'copy' => 'civicrm/admin/uf/group/copy?action=copy&reset=1&gid=[id]',
  ],
  'getIndices' => fn() => [
    'UI_name' => [
      'fields' => [
        'name' => TRUE,
      ],
      'unique' => TRUE,
      'add' => '4.7',
    ],
  ],
  'getFields' => fn() => [
    'id' => [
      'title' => ts('Profile ID'),
      'sql_type' => 'int unsigned',
      'input_type' => 'Number',
      'required' => TRUE,
      'description' => ts('Unique table ID'),
      'add' => '1.1',
      'primary_key' => TRUE,
      'auto_increment' => TRUE,
    ],
    'name' => [
      'title' => ts('Profile Name'),
      'sql_type' => 'varchar(64)',
      'input_type' => 'Text',
      'required' => TRUE,
      'description' => ts('Name of the UF group for directly addressing it in the codebase'),
      'add' => '3.0',
    ],
    'is_active' => [
      'title' => ts('Profile Is Active'),
      'sql_type' => 'boolean',
      'input_type' => 'CheckBox',
      'required' => TRUE,
      'description' => ts('Is this profile currently active? If FALSE, hide all related fields for all sharing contexts.'),
      'add' => '1.1',
      'default' => TRUE,
      'input_attrs' => [
        'label' => ts('Enabled'),
      ],
    ],
    'group_type' => [
      'title' => ts('Profile Group Type'),
      'sql_type' => 'varchar(255)',
      'input_type' => 'Text',
      'description' => ts('Comma separated list of the type(s) of profile fields.'),
      'add' => '2.1',
      'serialize' => CRM_Core_DAO::SERIALIZE_COMMA,
      'usage' => [
        'import',
        'export',
        'duplicate_matching',
      ],
    ],
    'title' => [
      'title' => ts('Profile Title'),
      'sql_type' => 'varchar(64)',
      'input_type' => 'Text',
      'required' => TRUE,
      'default_fallback' => ['frontend_title'],
      'localizable' => TRUE,
      'description' => ts('Form title.'),
      'add' => '1.1',
    ],
    'frontend_title' => [
      'title' => ts('Public Title'),
      'sql_type' => 'varchar(64)',
      'input_type' => 'Text',
      'required' => TRUE,
      'default_fallback' => ['title'],
      'localizable' => TRUE,
      'description' => ts('Profile Form Public title'),
      'add' => '4.7',
    ],
    'description' => [
      'title' => ts('Profile Description'),
      'sql_type' => 'text',
      'input_type' => 'TextArea',
      'description' => ts('Optional verbose description of the profile.'),
      'add' => '4.4',
      'input_attrs' => [
        'rows' => 2,
        'cols' => 60,
      ],
    ],
    'help_pre' => [
      'title' => ts('Help Pre'),
      'sql_type' => 'text',
      'input_type' => 'TextArea',
      'localizable' => TRUE,
      'description' => ts('Description and/or help text to display before fields in form.'),
      'add' => '1.2',
      'input_attrs' => [
        'rows' => 4,
        'cols' => 80,
        'label' => ts('Pre Help'),
      ],
    ],
    'help_post' => [
      'title' => ts('Profile Post Text'),
      'sql_type' => 'text',
      'input_type' => 'TextArea',
      'localizable' => TRUE,
      'description' => ts('Description and/or help text to display after fields in form.'),
      'add' => '1.2',
      'input_attrs' => [
        'rows' => 4,
        'cols' => 80,
      ],
    ],
    'limit_listings_group_id' => [
      'title' => ts('Search Limit Group ID'),
      'sql_type' => 'int unsigned',
      'input_type' => 'EntityRef',
      'description' => ts('Group id, foreign key from civicrm_group'),
      'add' => '1.4',
      'input_attrs' => [
        'label' => ts('Search Limit Group'),
      ],
      'entity_reference' => [
        'entity' => 'Group',
        'key' => 'id',
        'on_delete' => 'SET NULL',
      ],
    ],
    'post_url' => [
      'title' => ts('Post Url'),
      'sql_type' => 'varchar(255)',
      'input_type' => 'Text',
      'description' => ts('Redirect to URL on submit.'),
      'add' => '1.4',
      'input_attrs' => [
        'label' => ts('Post URL'),
      ],
    ],
    'add_to_group_id' => [
      'title' => ts('Add Contact To Group ID'),
      'sql_type' => 'int unsigned',
      'input_type' => 'EntityRef',
      'description' => ts('foreign key to civicrm_group_id'),
      'input_attrs' => [
        'label' => ts('Add Contact To Group'),
      ],
      'entity_reference' => [
        'entity' => 'Group',
        'key' => 'id',
        'on_delete' => 'SET NULL',
      ],
    ],
    'add_captcha' => [
      'title' => ts('Show Captcha On Profile'),
      'sql_type' => 'boolean',
      'input_type' => 'CheckBox',
      'required' => TRUE,
      'description' => ts('Should a CAPTCHA widget be included this Profile form.'),
      'add' => '1.1',
      'default' => FALSE,
    ],
    'is_map' => [
      'title' => ts('Map Profile'),
      'sql_type' => 'boolean',
      'input_type' => 'CheckBox',
      'required' => TRUE,
      'description' => ts('Do we want to map results from this profile.'),
      'add' => '1.5',
      'default' => FALSE,
    ],
    'is_edit_link' => [
      'title' => ts('Show Edit Link?'),
      'sql_type' => 'boolean',
      'input_type' => 'CheckBox',
      'required' => TRUE,
      'description' => ts('Should edit link display in profile selector'),
      'add' => '1.6',
      'default' => FALSE,
    ],
    'is_uf_link' => [
      'title' => ts('Show Link to CMS User'),
      'sql_type' => 'boolean',
      'input_type' => 'CheckBox',
      'required' => TRUE,
      'description' => ts('Should we display a link to the website profile in profile selector'),
      'add' => '1.7',
      'default' => FALSE,
    ],
    'is_update_dupe' => [
      'title' => ts('Update on Duplicate'),
      'sql_type' => 'boolean',
      'input_type' => 'CheckBox',
      'required' => TRUE,
      'description' => ts('Should we update the contact record if we find a duplicate'),
      'add' => '1.7',
      'default' => FALSE,
    ],
    'cancel_url' => [
      'title' => ts('Profile Cancel URL'),
      'sql_type' => 'varchar(255)',
      'input_type' => 'Text',
      'description' => ts('Redirect to URL when Cancel button clicked.'),
      'add' => '1.4',
      'input_attrs' => [
        'label' => ts('Cancel URL'),
      ],
    ],
    'is_cms_user' => [
      'title' => ts('Create CMS User?'),
      'sql_type' => 'boolean',
      'input_type' => 'CheckBox',
      'required' => TRUE,
      'description' => ts('Should we create a cms user for this profile'),
      'add' => '1.8',
      'default' => FALSE,
    ],
    'notify' => [
      'title' => ts('Notify on Profile Submit'),
      'sql_type' => 'text',
      'input_type' => 'TextArea',
      'add' => '1.8',
    ],
    'is_reserved' => [
      'title' => ts('Profile Is Reserved'),
      'sql_type' => 'boolean',
      'input_type' => 'Radio',
      'required' => TRUE,
      'description' => ts('Is this group reserved for use by some other CiviCRM functionality?'),
      'add' => '3.0',
      'default' => FALSE,
    ],
    'created_id' => [
      'title' => ts('Created By Contact ID'),
      'sql_type' => 'int unsigned',
      'input_type' => 'EntityRef',
      'description' => ts('FK to civicrm_contact, who created this UF group'),
      'add' => '3.0',
      'input_attrs' => [
        'label' => ts('Created By'),
      ],
      'entity_reference' => [
        'entity' => 'Contact',
        'key' => 'id',
        'on_delete' => 'SET NULL',
      ],
    ],
    'created_date' => [
      'title' => ts('UF Group Created Date'),
      'sql_type' => 'datetime',
      'input_type' => 'Select Date',
      'description' => ts('Date and time this UF group was created.'),
      'add' => '3.0',
    ],
    'is_proximity_search' => [
      'title' => ts('Include Proximity Search?'),
      'sql_type' => 'boolean',
      'input_type' => 'CheckBox',
      'required' => TRUE,
      'description' => ts('Should we include proximity search feature in this profile search form?'),
      'add' => '3.2',
      'default' => FALSE,
    ],
    'cancel_button_text' => [
      'title' => ts('Cancel Button Text'),
      'sql_type' => 'varchar(64)',
      'input_type' => 'Text',
      'localizable' => TRUE,
      'description' => ts('Custom Text to display on the Cancel button when used in create or edit mode'),
      'add' => '4.7',
      'default' => NULL,
    ],
    'submit_button_text' => [
      'title' => ts('Submit Button Text'),
      'sql_type' => 'varchar(64)',
      'input_type' => 'Text',
      'localizable' => TRUE,
      'description' => ts('Custom Text to display on the submit button on profile edit/create screens'),
      'add' => '4.7',
      'default' => NULL,
    ],
    'add_cancel_button' => [
      'title' => ts('Include Cancel Button'),
      'sql_type' => 'boolean',
      'input_type' => 'CheckBox',
      'required' => TRUE,
      'description' => ts('Should a Cancel button be included in this Profile form.'),
      'add' => '5.0',
      'default' => TRUE,
    ],
  ],
];
