INSERT IGNORE INTO `civicrm_mapping` (`id`, `name`, `description`, `mapping_type_id`) VALUES (315, 'test_315', NULL, NULL);

INSERT IGNORE INTO `civicrm_mapping_field` (`id`, `mapping_id`, `name`, `contact_type`, `column_number`, `location_type_id`, `phone_type_id`, `im_provider_id`, `relationship_type_id`, `relationship_direction`, `grouping`, `operator`, `value`, `website_type_id`) VALUES (7455, 315, 'email', 'Individual', 0, 5, NULL, NULL, NULL, NULL, 1, 'IS NOT EMPTY', '', NULL);
INSERT IGNORE INTO `civicrm_mapping_field` (`id`, `mapping_id`, `name`, `contact_type`, `column_number`, `location_type_id`, `phone_type_id`, `im_provider_id`, `relationship_type_id`, `relationship_direction`, `grouping`, `operator`, `value`, `website_type_id`) VALUES (7456, 315, 'do_not_email', 'Individual', 1, NULL, NULL, NULL, NULL, NULL, 1, '=', '0', NULL);
INSERT IGNORE INTO `civicrm_mapping_field` (`id`, `mapping_id`, `name`, `contact_type`, `column_number`, `location_type_id`, `phone_type_id`, `im_provider_id`, `relationship_type_id`, `relationship_direction`, `grouping`, `operator`, `value`, `website_type_id`) VALUES (7457, 315, 'state_province', 'Individual', 2, 5, NULL, NULL, NULL, NULL, 1, '=', 'Idaho', NULL);
INSERT IGNORE INTO `civicrm_mapping_field` (`id`, `mapping_id`, `name`, `contact_type`, `column_number`, `location_type_id`, `phone_type_id`, `im_provider_id`, `relationship_type_id`, `relationship_direction`, `grouping`, `operator`, `value`, `website_type_id`) VALUES (7458, 315, 'is_opt_out', 'Individual', 3, NULL, NULL, NULL, NULL, NULL, 1, '=', '0', NULL);
INSERT IGNORE INTO `civicrm_mapping_field` (`id`, `mapping_id`, `name`, `contact_type`, `column_number`, `location_type_id`, `phone_type_id`, `im_provider_id`, `relationship_type_id`, `relationship_direction`, `grouping`, `operator`, `value`, `website_type_id`) VALUES (7459, 315, 'on_hold', 'Individual', 4, 5, NULL, NULL, NULL, NULL, 1, '=', '0', NULL);


INSERT IGNORE INTO `civicrm_saved_search` (`id`, `form_values`, `mapping_id`, `search_custom_id`) VALUES (286, 'a:8:{s:5:"qfKey";s:37:"92bf8874b4cd856436833fba5526a10f_9684";s:6:"mapper";a:2:{i:1;a:5:{i:0;a:3:{i:0;s:10:"Individual";i:1;s:5:"email";i:2;s:1:"5";}i:1;a:2:{i:0;s:10:"Individual";i:1;s:12:"do_not_email";}i:2;a:3:{i:0;s:10:"Individual";i:1;s:14:"state_province";i:2;s:1:"5";}i:3;a:2:{i:0;s:10:"Individual";i:1;s:10:"is_opt_out";}i:4;a:3:{i:0;s:10:"Individual";i:1;s:7:"on_hold";i:2;s:1:"5";}}i:2;a:1:{i:0;a:1:{i:0;s:0:"";}}}s:8:"operator";a:2:{i:1;a:5:{i:0;s:11:"IS NOT NULL";i:1;s:1:"=";i:2;s:1:"=";i:3;s:1:"=";i:4;s:1:"=";}i:2;a:1:{i:0;s:0:"";}}s:5:"value";a:2:{i:1;a:5:{i:0;s:0:"";i:1;s:1:"0";i:2;s:5:"Idaho";i:3;s:1:"0";i:4;s:1:"0";}i:2;a:1:{i:0;s:0:"";}}s:4:"task";s:2:"13";s:8:"radio_ts";s:6:"ts_all";s:11:"uf_group_id";s:0:"";s:14:"component_mode";i:1;}', 315, NULL);

INSERT IGNORE INTO `civicrm_group` (`id`, `name`, `title`, `frontend_title`, `description`, `source`, `saved_search_id`, `is_active`, `visibility`, `where_clause`, `select_tables`, `where_tables`, `group_type`, `cache_date`, `refresh_date`, `parents`, `children`, `is_hidden`, `is_reserved`, `created_id`) VALUES (801, 'Idaho EmailContacts', 'Idaho Email Contacts', 'Idaho Email Contacts', NULL, NULL, 286, 1, 'User and User Admin Only', ' ( `civicrm_group_contact_cache_801`.group_id = 801 ) ', 'a:12:{s:15:"civicrm_contact";i:1;s:15:"civicrm_address";i:1;s:22:"civicrm_state_province";i:1;s:15:"civicrm_country";i:1;s:13:"civicrm_email";i:1;s:13:"civicrm_phone";i:1;s:10:"civicrm_im";i:1;s:19:"civicrm_worldregion";i:1;s:33:"`civicrm_group_contact_cache_801`";s:136:" LEFT JOIN civicrm_group_contact_cache `civicrm_group_contact_cache_801` ON contact_a.id = `civicrm_group_contact_cache_801`.contact_id ";s:6:"gender";i:1;s:17:"individual_prefix";i:1;s:17:"individual_suffix";i:1;}', 'a:2:{s:15:"civicrm_contact";i:1;s:33:"`civicrm_group_contact_cache_801`";s:136:" LEFT JOIN civicrm_group_contact_cache `civicrm_group_contact_cache_801` ON contact_a.id = `civicrm_group_contact_cache_801`.contact_id ";}', '2', '2014-06-26 03:31:03', NULL, NULL, NULL, 0, 0, NULL);
