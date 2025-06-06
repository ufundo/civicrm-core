<?php

return [
  'name' => 'MailingGroup',
  'table' => 'civicrm_mailing_group',
  'class' => 'CRM_Mailing_DAO_MailingGroup',
  'getInfo' => fn() => [
    'title' => ts('Mailing Group'),
    'title_plural' => ts('Mailing Groups'),
    'description' => ts('Stores information about the target recipients for a mailing.'),
  ],
  'getFields' => fn() => [
    'id' => [
      'title' => ts('Mailing Group ID'),
      'sql_type' => 'int unsigned',
      'input_type' => 'Number',
      'required' => TRUE,
      'primary_key' => TRUE,
      'auto_increment' => TRUE,
    ],
    'mailing_id' => [
      'title' => ts('Mailing ID'),
      'sql_type' => 'int unsigned',
      'input_type' => 'EntityRef',
      'required' => TRUE,
      'description' => ts('ID of the target mailing.'),
      'input_attrs' => [
        'label' => ts('Mailing'),
      ],
      'entity_reference' => [
        'entity' => 'Mailing',
        'key' => 'id',
        'on_delete' => 'CASCADE',
      ],
    ],
    'group_type' => [
      'title' => ts('Mailing Group Type'),
      'sql_type' => 'varchar(8)',
      'input_type' => 'Select',
      'description' => ts('Are contacts from the source entity being included or excluded?'),
      'pseudoconstant' => [
        'callback' => ['CRM_Core_SelectValues', 'getMailingGroupTypes'],
      ],
    ],
    'entity_table' => [
      'title' => ts('Mailing Group Entity Table'),
      'sql_type' => 'varchar(64)',
      'input_type' => 'Select',
      'required' => TRUE,
      'description' => ts('Table for the source entity - usually civicrm_group for a mailing group, or civicrm_mailing for previous mailing.'),
      'pseudoconstant' => [
        'callback' => ['CRM_Mailing_BAO_Mailing', 'mailingGroupEntityTables'],
      ],
    ],
    'entity_id' => [
      'title' => ts('Mailing Group Entity'),
      'sql_type' => 'int unsigned',
      'input_type' => 'EntityRef',
      'required' => TRUE,
      'description' => ts('Dynamic foreign key to the recipient source entity.'),
      'entity_reference' => [
        'dynamic_entity' => 'entity_table',
        'key' => 'id',
      ],
    ],
    'search_id' => [
      'title' => ts('Mailing Group Search'),
      'sql_type' => 'int',
      'input_type' => 'Number',
      'description' => ts('The filtering search. custom search id or -1 for civicrm api search'),
    ],
    'search_args' => [
      'title' => ts('Mailing Group Search Arguments'),
      'sql_type' => 'text',
      'input_type' => 'TextArea',
      'description' => ts('The arguments to be sent to the search function'),
    ],
  ],
];
