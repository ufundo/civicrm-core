<?php
/*
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC. All rights reserved.                        |
 |                                                                    |
 | This work is published under the GNU AGPLv3 license with some      |
 | permitted exceptions and without any warranty. For full license    |
 | and copyright information, see https://civicrm.org/licensing       |
 +--------------------------------------------------------------------+
 */

/**
 *
 * @package CRM
 * @copyright CiviCRM LLC https://civicrm.org/licensing
 */
class CRM_Contact_Form_Search_Custom_TagContributions extends CRM_Contact_Form_Search_Custom_Base implements CRM_Contact_Form_Search_Interface {

  protected $_formValues;
  protected $_aclFrom = NULL;
  protected $_aclWhere = NULL;
  public $_permissionedComponent;

  /**
   * Class constructor.
   *
   * @param array $formValues
   */
  public function __construct(&$formValues) {
    $this->_formValues = self::formatSavedSearchFields($formValues);
    $this->_permissionedComponent = 'CiviContribute';

    /**
     * Define the columns for search result rows
     */
    $this->_columns = [
      ts('Contact ID') => 'contact_id',
      ts('Full Name') => 'sort_name',
      ts('First Name') => 'first_name',
      ts('Last Name') => 'last_name',
      ts('Tag') => 'tag_name',
      ts('Totals') => 'amount',
    ];
  }

  /**
   * @param CRM_Core_Form $form
   */
  public function buildForm(&$form) {

    /**
     * You can define a custom title for the search form
     */
    $this->setTitle(ts('Find Contribution Amounts by Tag'));

    /**
     * Define the search form fields here
     */

    $form->add('datepicker', 'start_date', ts('Contribution Date From'), [], FALSE, ['time' => FALSE]);
    $form->add('datepicker', 'end_date', ts('...through'), [], FALSE, ['time' => FALSE]);
    $tag = ['' => ts('- any tag -')] + CRM_Core_DAO_EntityTag::buildOptions('tag_id', 'get');
    $form->addElement('select', 'tag', ts('Tagged'), $tag);

    /**
     * If you are using the sample template, this array tells the template fields to render
     * for the search form.
     */
    $form->assign('elements', ['start_date', 'end_date', 'tag']);
  }

  /**
   * Define the smarty template used to layout the search form and results listings.
   */
  public function templateFile() {
    return 'CRM/Contact/Form/Search/Custom.tpl';
  }

  /**
   * Construct the search query.
   *
   * @param int $offset
   * @param int $rowcount
   * @param string $sort
   * @param bool $includeContactIDs
   * @param bool $onlyIDs
   *
   * @return string
   */
  public function all(
    $offset = 0, $rowcount = 0, $sort = NULL,
    $includeContactIDs = FALSE, $onlyIDs = FALSE
  ) {

    // SELECT clause must include contact_id as an alias for civicrm_contact.id
    if ($onlyIDs) {
      $select = "contact_a.id as contact_id";
    }
    else {
      $select = "
DISTINCT
contact_a.id as contact_id,
contact_a.sort_name as sort_name,
contact_a.first_name as first_name,
contact_a.last_name as last_name,
GROUP_CONCAT(DISTINCT civicrm_tag.name ORDER BY  civicrm_tag.name ASC ) as tag_name,
sum(civicrm_contribution.total_amount) as amount
";
    }
    $from = $this->from();

    $where = $this->where($includeContactIDs);

    $sql = "
SELECT $select
FROM   $from
WHERE  $where
";

    $sql .= " GROUP BY contact_a.id";
    // Define ORDER BY for query in $sort, with default value
    if (!empty($sort)) {
      if (is_string($sort)) {
        $sort = CRM_Utils_Type::escape($sort, 'String');
        $sql .= " ORDER BY $sort ";
      }
      else {
        $sql .= " ORDER BY " . trim($sort->orderBy());
      }
    }
    else {
      $sql .= "";
    }
    return $sql;
  }

  /**
   * @return string
   */
  public function from() {
    $this->buildACLClause('contact_a');
    $from = "
      civicrm_contribution,
      civicrm_contact contact_a
      LEFT JOIN civicrm_entity_tag ON ( civicrm_entity_tag.entity_table = 'civicrm_contact' AND
                                        civicrm_entity_tag.entity_id = contact_a.id )
      LEFT JOIN civicrm_tag ON civicrm_tag.id = civicrm_entity_tag.tag_id {$this->_aclFrom}
     ";
    return $from;
  }

  /*
   * WHERE clause is an array built from any required JOINS plus conditional filters based on search criteria field values
   *
   */

  /**
   * @param bool $includeContactIDs
   *
   * @return string
   */
  public function where($includeContactIDs = FALSE) {
    $clauses = [];

    $clauses[] = "contact_a.contact_type = 'Individual'";
    $clauses[] = "civicrm_contribution.contact_id = contact_a.id";

    if ($this->_formValues['start_date']) {
      $clauses[] = "civicrm_contribution.receive_date >= '{$this->_formValues['start_date']} 00:00:00'";
    }

    if ($this->_formValues['end_date']) {
      $clauses[] = "civicrm_contribution.receive_date <= '{$this->_formValues['end_date']} 23:59:59'";
    }

    $tag = $this->_formValues['tag'] ?? NULL;
    if ($tag) {
      $clauses[] = "civicrm_entity_tag.tag_id = $tag";
      $clauses[] = "civicrm_tag.id = civicrm_entity_tag.tag_id";
    }
    else {
      $clauses[] = "civicrm_entity_tag.tag_id IS NOT NULL";
    }

    if ($includeContactIDs) {
      $contactIDs = [];
      foreach ($this->_formValues as $id => $value) {
        if ($value &&
          substr($id, 0, CRM_Core_Form::CB_PREFIX_LEN) == CRM_Core_Form::CB_PREFIX
        ) {
          $contactIDs[] = substr($id, CRM_Core_Form::CB_PREFIX_LEN);
        }
      }

      if (!empty($contactIDs)) {
        $contactIDs = implode(', ', $contactIDs);
        $clauses[] = "contact_a.id IN ( $contactIDs )";
      }
    }
    if ($this->_aclWhere) {
      $clauses[] = " {$this->_aclWhere} ";
    }
    return implode(' AND ', $clauses);
  }

  /*
   * Functions below generally don't need to be modified
   */

  /**
   * @inheritDoc
   */
  public function count() {
    $sql = $this->all();

    $dao = CRM_Core_DAO::executeQuery($sql);
    return $dao->N;
  }

  /**
   * @param int $offset
   * @param int $rowcount
   * @param null $sort
   * @param bool $returnSQL Not used; included for consistency with parent; SQL is always returned
   *
   * @return string
   */
  public function contactIDs($offset = 0, $rowcount = 0, $sort = NULL, $returnSQL = TRUE) {
    return $this->all($offset, $rowcount, $sort, FALSE, TRUE);
  }

  /**
   * @return array
   */
  public function &columns() {
    return $this->_columns;
  }

  /**
   * @return null
   */
  public function summary() {
    return NULL;
  }

  /**
   * @param string $tableAlias
   */
  public function buildACLClause($tableAlias = 'contact') {
    list($this->_aclFrom, $this->_aclWhere) = CRM_Contact_BAO_Contact_Permission::cacheClause($tableAlias);
  }

  /**
   * Format saved search fields for this custom group.
   *
   * Note this is a function to facilitate the transition to jcalendar for
   * saved search groups. In time it can be stripped out again.
   *
   * @param array $formValues
   *
   * @return array
   */
  public static function formatSavedSearchFields($formValues) {
    $dateFields = [
      'start_date',
      'end_date',
    ];
    foreach ($formValues as $element => $value) {
      if (in_array($element, $dateFields) && !empty($value)) {
        $formValues[$element] = date('Y-m-d', strtotime($value));
      }
    }
    return $formValues;
  }

}
