const router = require('express').Router();

const db = require('./model');
const {
  reqFields,
  orgCheckIssue,
  orgCheckParam,
  stripIssueBody,
  onlyRoles,
  statusPrevent
} = require('../middleware');

router.get('/', (req, res) => {
  const {org_id} = req;
  return db.getIssues([org_id])
    .then(issues => {
      !!issues.length
        ? res.status(200).json(issues)
        : res.status(404).json({ error: 'No issues exist in our database for your organization(s)' });
    })
    .catch(err => {
      res.status(500).json({ error: 'Could not retrieve issues from the database' })
    })
})

const reqPostIssue = [ 'name', 'status_id' ]
router.post('/', stripIssueBody()(), reqFields(reqPostIssue), onlyRoles([1]), (req, res) => {
  const { body, user_id, org_id } = req;
  return db.postIssue(body, user_id, org_id)
    .then(issues => {
      res.status(201).json(issues);
    })
    .catch(err => {
      res.status(500).json({ error: 'Could not create the new issue' })
    })
})

router.get('/:id', (req, res) => {
  const {id} = req.params;
  const {org_id} = req;
  return db.getIssueByID(id)
    .then(issue => {
      if(!issue) {
        res.status(404).json({ error: `An issue with ID ${id} does not exist in our database` }); // This isn't working yet
      } else if(issue.org_id !== org_id) {
        res.status(403).json({ error: `You do no have permission to view the issue with ID ${id}`})
      } else {
        res.status(200).json(issue);
      }
    })
    .catch(err => {
      res.status(500).json({ error: `Could not retrieve the issue with ID ${id}` })
    })
})

const putRoleFields = { 2: ['comments', 'status_id'] }
router.put('/:id', orgCheckIssue, stripIssueBody()(putRoleFields), (req, res) => {
  const {id} = req.params;
  const { body, user_id, org_id } = req;
  return db.putIssue(id, body, user_id, org_id)
    .then(issues => {
      res.status(200).json(issues);
    })
    .catch(err => {
      res.status(500).json({ error: `Could not edit the issue with ID ${id}` })
    })
})

router.delete('/:id', statusPrevent([1, 4]), orgCheckIssue, (req, res) => {
  const {id} = req.params;
  const {org_id} = req;
  return db.delIssue(id, org_id)
    .then(issues => {
      Array.isArray(issues)
        ? res.status(200).json(issues)
        : res.status(200).json({ message: `The item with ID ${id} was successfully deleted, but no more issues exist for you` })
    })
    .catch(err => {
      res.status(500).json({ error: `Could not edit the issue with ID ${id}` })
    })
})

router.get('/org/:org_id', orgCheckParam, (req, res) => {
  const {org_id} = req.params;
  return db.getIssues([org_id])
    .then(issues => {
      !!issues.length
        ? res.status(200).json(issues)
        : res.status(404).json({ error: `No issues exist in our database with organization ID ${org_id}` });
    })
    .catch(err => {
      res.status(500).json({ error: `Could not retrieve issues from the database with organization ID ${org_id}` })
    })
})

module.exports = router;
